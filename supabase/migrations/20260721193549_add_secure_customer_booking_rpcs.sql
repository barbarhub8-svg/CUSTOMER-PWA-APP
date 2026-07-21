create or replace function public.create_customer_booking(
  p_shop_id uuid,
  p_service_id uuid,
  p_booking_date date,
  p_start_time time
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_service public.services%rowtype;
  v_shop public.shops%rowtype;
  v_booking_id uuid;
  v_end_time time;
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id
    and shop_id = p_shop_id
    and is_active = true
    and is_archived = false;

  if not found then
    raise exception 'SERVICE_NOT_AVAILABLE' using errcode = '22023';
  end if;

  select * into v_shop
  from public.shops
  where id = p_shop_id
    and is_active = true
    and (approval_status = 'approved' or is_published = true)
    and coalesce(is_temporarily_closed, false) = false;

  if not found then
    raise exception 'SHOP_NOT_AVAILABLE' using errcode = '22023';
  end if;

  if p_booking_date < current_date then
    raise exception 'BOOKING_DATE_IN_PAST' using errcode = '22023';
  end if;

  v_end_time := p_start_time + make_interval(mins => v_service.duration_minutes);

  if exists (
    select 1 from public.bookings b
    where b.shop_id = p_shop_id
      and b.booking_date = p_booking_date
      and b.status not in ('cancelled', 'rejected', 'no_show')
      and p_start_time < b.end_time
      and v_end_time > b.start_time
  ) then
    raise exception 'SLOT_NOT_AVAILABLE' using errcode = '23P01';
  end if;

  insert into public.bookings (
    customer_id, shop_id, booking_date, start_time, end_time,
    subtotal_amount, final_amount, payment_status, status, booking_source
  ) values (
    v_user_id, p_shop_id, p_booking_date, p_start_time, v_end_time,
    v_service.price, v_service.price, 'unpaid', 'pending', 'customer_app'
  ) returning id into v_booking_id;

  insert into public.booking_items (
    booking_id, service_id, service_name_snapshot,
    price_snapshot, duration_snapshot
  ) values (
    v_booking_id, v_service.id, v_service.name,
    v_service.price, v_service.duration_minutes
  );

  return v_booking_id;
end;
$function$;

create or replace function public.cancel_customer_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  update public.bookings
  set status = 'cancelled',
      cancelled_by = v_user_id,
      cancellation_reason = 'Cancelled by customer',
      updated_at = now()
  where id = p_booking_id
    and customer_id = v_user_id
    and status in ('pending', 'confirmed');

  if not found then
    raise exception 'BOOKING_NOT_CANCELLABLE' using errcode = '22023';
  end if;
end;
$function$;

revoke all on function public.create_customer_booking(uuid, uuid, date, time) from public;
revoke all on function public.create_customer_booking(uuid, uuid, date, time) from anon;
grant execute on function public.create_customer_booking(uuid, uuid, date, time) to authenticated;

revoke all on function public.cancel_customer_booking(uuid) from public;
revoke all on function public.cancel_customer_booking(uuid) from anon;
grant execute on function public.cancel_customer_booking(uuid) to authenticated;
