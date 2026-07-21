import { supabase } from '../../lib/supabase'
import type { Booking, BookingStatus, Profile, RewardSummary, Salon } from './data'

const salonColors = ['from-violet-500 to-fuchsia-400', 'from-sky-500 to-cyan-400', 'from-emerald-500 to-teal-400']

type CatalogShopRow = {
  id: string
  name: string
  address: string | null
  city: string | null
  district: string | null
  rating_average: number | null
  review_count: number | null
  opening_status: string | null
  is_temporarily_closed: boolean | null
  cover_image_url: string | null
  service_categories: { name: string } | { name: string }[] | null
  services: Array<{ id: string; name: string; duration_minutes: number; price: number; discount_price: number | null }>
}

type BookingRow = {
  id: string
  booking_reference: string | null
  booking_date: string
  start_time: string
  final_amount: number
  status: string | null
  shops: { name: string } | { name: string }[] | null
  booking_items: Array<{ service_name_snapshot: string }>
}

export async function loadCatalog(): Promise<{ salons: Salon[]; categories: string[] }> {
  const [shopsResult, categoriesResult] = await Promise.all([
    supabase.from('shops').select('id,name,address,city,district,rating_average,review_count,opening_status,is_temporarily_closed,cover_image_url,service_categories(name),services(id,name,duration_minutes,price,discount_price)').order('rating_average', { ascending: false }),
    supabase.from('service_categories').select('name').eq('is_active', true).order('display_order'),
  ])
  if (shopsResult.error) throw shopsResult.error
  if (categoriesResult.error) throw categoriesResult.error

  const shopRows = (shopsResult.data ?? []) as unknown as CatalogShopRow[]
  const salons = shopRows.map((shop, index) => {
    const category = Array.isArray(shop.service_categories) ? shop.service_categories[0]?.name : shop.service_categories?.name
    return {
      id: shop.id,
      name: shop.name,
      area: shop.district || shop.address || shop.city || 'Location unavailable',
      city: shop.city || '',
      rating: Number(shop.rating_average ?? 0),
      reviews: Number(shop.review_count ?? 0),
      open: shop.opening_status === 'open' && !shop.is_temporarily_closed,
      category: category || 'Salon',
      coverImageUrl: shop.cover_image_url,
      color: salonColors[index % salonColors.length],
      services: (shop.services ?? []).map(service => ({
        id: service.id,
        name: service.name,
        duration: service.duration_minutes,
        price: Number(service.discount_price ?? service.price),
      })),
    }
  }).filter(salon => salon.services.length > 0)

  return { salons, categories: (categoriesResult.data ?? []).map(category => category.name) }
}

function titleStatus(status: string | null): BookingStatus {
  if (status === 'confirmed' || status === 'in_progress') return 'Confirmed'
  if (status === 'completed') return 'Completed'
  if (status === 'cancelled' || status === 'rejected' || status === 'no_show') return 'Cancelled'
  return 'Pending'
}

export async function loadBookings(): Promise<Booking[]> {
  const { data, error } = await supabase.from('bookings').select('id,booking_reference,booking_date,start_time,final_amount,status,shops(name),booking_items(service_name_snapshot)').order('booking_date', { ascending: false }).order('start_time', { ascending: false })
  if (error) throw error
  const bookingRows = (data ?? []) as unknown as BookingRow[]
  return bookingRows.map(booking => ({
    id: booking.id,
    reference: booking.booking_reference || booking.id.slice(0, 8).toUpperCase(),
    salon: Array.isArray(booking.shops) ? booking.shops[0]?.name ?? 'Salon' : booking.shops?.name ?? 'Salon',
    service: booking.booking_items?.[0]?.service_name_snapshot ?? 'Appointment',
    date: booking.booking_date,
    time: booking.start_time.slice(0, 5),
    amount: Number(booking.final_amount),
    status: titleStatus(booking.status),
  }))
}

export async function createBooking(shopId: string, serviceId: string, date: string, time: string) {
  const { error } = await supabase.rpc('create_customer_booking', {
    p_shop_id: shopId,
    p_service_id: serviceId,
    p_booking_date: date,
    p_start_time: time,
  })
  if (error) throw error
}

export async function cancelBooking(bookingId: string) {
  const { error } = await supabase.rpc('cancel_customer_booking', { p_booking_id: bookingId })
  if (error) throw error
}

export async function loadFavouriteShopIds(): Promise<string[]> {
  const { data, error } = await supabase.from('favourites').select('shop_id').not('shop_id', 'is', null)
  if (error) throw error
  return (data ?? []).flatMap(favourite => favourite.shop_id ? [favourite.shop_id] : [])
}

export async function toggleFavouriteShop(userId: string, shopId: string, isFavourite: boolean) {
  if (isFavourite) {
    const { error } = await supabase.from('favourites').delete().eq('customer_id', userId).eq('shop_id', shopId)
    if (error) throw error
    return
  }
  const { error } = await supabase.from('favourites').insert({ customer_id: userId, shop_id: shopId })
  if (error) throw error
}

export async function loadProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('id,full_name,email,mobile,avatar_url').eq('id', userId).single()
  if (error) throw error
  let avatarUrl: string | null = null
  if (data.avatar_url) {
    const signed = await supabase.storage.from('avatars').createSignedUrl(data.avatar_url, 3600)
    avatarUrl = signed.data?.signedUrl ?? null
  }
  return { id: data.id, fullName: data.full_name ?? '', email: data.email ?? '', mobile: data.mobile ?? '', avatarPath: data.avatar_url, avatarUrl }
}

export async function updateProfile(userId: string, fullName: string, mobile: string) {
  const { error } = await supabase.from('profiles').update({ full_name: fullName.trim(), mobile: mobile.trim() || null }).eq('id', userId)
  if (error) throw error
}

export async function uploadAvatar(userId: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/avatar.${extension}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) throw uploadError
  const { error: profileError } = await supabase.from('profiles').update({ avatar_url: path }).eq('id', userId)
  if (profileError) throw profileError
}

export async function loadRewards(): Promise<RewardSummary> {
  const { data, error } = await supabase.from('reward_wallets').select('available_balance,lifetime_earned,lifetime_redeemed').maybeSingle()
  if (error) throw error
  return { available: Number(data?.available_balance ?? 0), earned: Number(data?.lifetime_earned ?? 0), redeemed: Number(data?.lifetime_redeemed ?? 0) }
}
