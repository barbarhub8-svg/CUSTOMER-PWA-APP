import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import type { Booking, Profile, RewardSummary, Salon } from './data'
import * as api from './customerApi'

type Store = {
  bookings: Booking[]
  salons: Salon[]
  categories: string[]
  favourites: string[]
  profile: Profile | null
  rewards: RewardSummary
  loading: boolean
  error: string
  refresh: () => Promise<void>
  createBooking: (shopId: string, serviceId: string, date: string, time: string) => Promise<void>
  cancelBooking: (id: string) => Promise<void>
  toggleFavourite: (id: string) => Promise<void>
  saveProfile: (fullName: string, mobile: string) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
}

const StoreContext = createContext<Store | null>(null)
const emptyRewards = { available: 0, earned: 0, redeemed: 0 }

export function CustomerStore({ children }: PropsWithChildren) {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [salons, setSalons] = useState<Salon[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [favourites, setFavourites] = useState<string[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [rewards, setRewards] = useState<RewardSummary>(emptyRewards)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [catalog, nextBookings, nextFavourites, nextProfile, nextRewards] = await Promise.all([
        api.loadCatalog(), api.loadBookings(), api.loadFavouriteShopIds(), api.loadProfile(user.id), api.loadRewards(),
      ])
      setSalons(catalog.salons)
      setCategories(catalog.categories)
      setBookings(nextBookings)
      setFavourites(nextFavourites)
      setProfile(nextProfile)
      setRewards(nextRewards)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load your account.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { void refresh() }, [refresh])

  const value = useMemo<Store>(() => ({
    bookings, salons, categories, favourites, profile, rewards, loading, error, refresh,
    createBooking: async (shopId, serviceId, date, time) => { await api.createBooking(shopId, serviceId, date, time); await refresh() },
    cancelBooking: async id => { await api.cancelBooking(id); await refresh() },
    toggleFavourite: async id => { if (!user) return; const active = favourites.includes(id); setFavourites(current => active ? current.filter(value => value !== id) : [...current, id]); try { await api.toggleFavouriteShop(user.id, id, active) } catch (caught) { setFavourites(current => active ? [...current, id] : current.filter(value => value !== id)); throw caught } },
    saveProfile: async (fullName, mobile) => { if (!user) return; await api.updateProfile(user.id, fullName, mobile); await refresh() },
    uploadAvatar: async file => { if (!user) return; await api.uploadAvatar(user.id, file); await refresh() },
  }), [bookings, categories, error, favourites, loading, profile, refresh, rewards, salons, user])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useCustomerStore() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('CustomerStore missing')
  return value
}
