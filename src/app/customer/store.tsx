import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Booking, initialBookings } from './data'

type Store = { bookings: Booking[]; addBooking: (b: Booking) => void; cancelBooking: (id: string) => void; favourites: string[]; toggleFavourite: (id: string) => void }
const StoreContext = createContext<Store | null>(null)

export function CustomerStore({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => JSON.parse(localStorage.getItem('nexora-bookings') || 'null') || initialBookings)
  const [favourites, setFavourites] = useState<string[]>(() => JSON.parse(localStorage.getItem('nexora-favourites') || '[]'))
  useEffect(() => localStorage.setItem('nexora-bookings', JSON.stringify(bookings)), [bookings])
  useEffect(() => localStorage.setItem('nexora-favourites', JSON.stringify(favourites)), [favourites])
  const value = useMemo(() => ({ bookings, addBooking: (b: Booking) => setBookings(x => [b, ...x]), cancelBooking: (id: string) => setBookings(x => x.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b)), favourites, toggleFavourite: (id: string) => setFavourites(x => x.includes(id) ? x.filter(v => v !== id) : [...x, id]) }), [bookings, favourites])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useCustomerStore = () => { const value = useContext(StoreContext); if (!value) throw new Error('CustomerStore missing'); return value }
