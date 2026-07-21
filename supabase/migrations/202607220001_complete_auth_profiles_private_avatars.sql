-- Complete and harden the Supabase auth/profile foundation.

alter table public.profiles enable row level security;

insert into public.profiles (id, full_name, email)
select
  u.id,
  coalesce(
    nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'name'), '')
  ),
  u.email
from auth.users as u
on conflict (id) do update
set email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);

alter table public.profiles
  alter column created_at set not null,
  alter column updated_at set not null;

create unique index if not exists profiles_email_lower_uidx
  on public.profiles (lower(email))
  where email is not null;

create index if not exists profiles_mobile_idx
  on public.profiles (mobile)
  where mobile is not null;

create index if not exists profiles_updated_at_idx
  on public.profiles (updated_at desc);

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant all privileges on table public.profiles to service_role;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_customer_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  ref_code text;
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), '')
    ),
    new.email
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name);

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id, role) do nothing;

  insert into public.reward_wallets (customer_id)
  values (new.id)
  on conflict (customer_id) do nothing;

  ref_code := 'NX' || upper(substring(md5(new.id::text) from 1 for 8));

  insert into public.referral_codes
    (customer_id, referral_code, referral_link)
  values
    (new.id, ref_code, 'https://nexora.app/ref/' || ref_code)
  on conflict (customer_id) do nothing;

  return new;
end;
$function$;

revoke all on function public.handle_new_customer_user() from public;
revoke all on function public.handle_new_customer_user() from anon;
revoke all on function public.handle_new_customer_user() from authenticated;
grant execute on function public.handle_new_customer_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_customer_user();

insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update
set name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can delete media" on storage.objects;
drop policy if exists "Authenticated users can delete own uploaded objects" on storage.objects;
drop policy if exists "Authenticated users can update media" on storage.objects;
drop policy if exists "Authenticated users can update own uploaded objects" on storage.objects;
drop policy if exists "Authenticated users can upload media" on storage.objects;
drop policy if exists "Authenticated users can upload shop images" on storage.objects;
drop policy if exists "Public can view public media" on storage.objects;
drop policy if exists "Public can view public shop images" on storage.objects;

create policy "Authenticated users can upload media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = any (array[
    'salon-media', 'support-attachments', 'shop-logos', 'shop-covers',
    'shop-services', 'shop-staff', 'shop-media'
  ]::text[])
);

create policy "Public can view public media"
on storage.objects for select
to public
using (
  bucket_id = any (array[
    'salon-media', 'shop-logos', 'shop-covers',
    'shop-services', 'shop-staff', 'shop-media'
  ]::text[])
);

drop policy if exists "Users can delete their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users delete own avatars" on storage.objects;
drop policy if exists "Users read own avatars" on storage.objects;
drop policy if exists "Users update own avatars" on storage.objects;
drop policy if exists "Users upload own avatars" on storage.objects;
drop policy if exists "avatars_select_own" on storage.objects;
drop policy if exists "avatars_insert_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;

create policy "avatars_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "avatars_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "avatars_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "avatars_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
