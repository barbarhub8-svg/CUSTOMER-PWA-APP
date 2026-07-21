export type Service = { id: string; name: string; duration: number; price: number }
export type Salon = { id: string; name: string; area: string; distance: string; rating: number; reviews: number; open: boolean; category: string; color: string; services: Service[] }

export const salons: Salon[] = [
  { id: 'glamour', name: 'Glamour Studio', area: 'Vaishali Nagar', distance: '1.2 km', rating: 4.8, reviews: 124, open: true, category: 'Unisex salon', color: 'from-violet-500 to-fuchsia-400', services: [
    { id: 'haircut', name: 'Signature Haircut', duration: 45, price: 399 }, { id: 'facial', name: 'Glow Facial', duration: 60, price: 799 }, { id: 'spa', name: 'Hair Spa', duration: 50, price: 699 }] },
  { id: 'urban', name: 'Urban Trim & Co.', area: 'C-Scheme', distance: '2.4 km', rating: 4.7, reviews: 89, open: true, category: 'Barber', color: 'from-sky-500 to-cyan-400', services: [
    { id: 'cut', name: 'Classic Haircut', duration: 30, price: 299 }, { id: 'beard', name: 'Beard Styling', duration: 25, price: 199 }, { id: 'combo', name: 'Hair + Beard Combo', duration: 55, price: 449 }] },
  { id: 'serene', name: 'Serene Spa', area: 'Malviya Nagar', distance: '3.1 km', rating: 4.9, reviews: 211, open: false, category: 'Spa & wellness', color: 'from-emerald-500 to-teal-400', services: [
    { id: 'massage', name: 'Swedish Massage', duration: 60, price: 1299 }, { id: 'therapy', name: 'Aroma Therapy', duration: 75, price: 1599 }] },
]

export const categories = ['Hair Salon', 'Barber', 'Spa', 'Beauty Parlour']
export const times = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM']

export type Booking = { id: string; salon: string; service: string; date: string; time: string; amount: number; status: 'Confirmed' | 'Completed' | 'Cancelled' }
export const initialBookings: Booking[] = [
  { id: 'NXB-2407', salon: 'Glamour Studio', service: 'Glow Facial', date: '24 Jul 2026', time: '2:30 PM', amount: 799, status: 'Confirmed' },
  { id: 'NXB-1806', salon: 'Urban Trim & Co.', service: 'Classic Haircut', date: '18 Jun 2026', time: '11:30 AM', amount: 299, status: 'Completed' },
]
