export type Service = {
  id: string
  name: string
  duration: number
  price: number
}

export type Salon = {
  id: string
  name: string
  area: string
  city: string
  rating: number
  reviews: number
  open: boolean
  category: string
  color: string
  coverImageUrl: string | null
  services: Service[]
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'

export type Booking = {
  id: string
  reference: string
  salon: string
  service: string
  date: string
  time: string
  amount: number
  status: BookingStatus
}

export type Profile = {
  id: string
  fullName: string
  email: string
  mobile: string
  avatarPath: string | null
  avatarUrl: string | null
}

export type RewardSummary = {
  available: number
  earned: number
  redeemed: number
}

export const times = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30']
