import { useMemo, useState } from 'react'
import { CalendarDays, Check, ChevronLeft, Clock, MapPin, Star } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { times } from '../data'
import { useCustomerStore } from '../store'

function dateOptions() {
  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index + 1)
    return { value: date.toISOString().slice(0, 10), label: new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date) }
  })
}

export default function BookNowScreen() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { salons, createBooking, loading } = useCustomerStore()
  const initialSalon = Math.max(0, salons.findIndex(salon => salon.id === params.get('salon')))
  const [salonIndex, setSalonIndex] = useState(initialSalon)
  const [serviceId, setServiceId] = useState('')
  const [day, setDay] = useState(0)
  const [time, setTime] = useState(times[3])
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dates = useMemo(() => dateOptions(), [])
  const salon = salons[salonIndex]
  const selectedServiceId = serviceId || salon?.services[0]?.id || ''
  const service = salon?.services.find(item => item.id === selectedServiceId) ?? salon?.services[0]

  if (loading) return <main className="page center-screen"><p>Loading live services…</p></main>
  if (!salon || !service) return <main className="page center-screen"><h1>No services available</h1><p className="muted mt-2 text-center">Add and publish a shop with active services in Supabase first.</p><button className="text-button" onClick={() => navigate('/app/customer')}>Back to home</button></main>
  if (done) return <main className="page center-screen"><div className="success-mark"><Check/></div><p className="eyebrow">BOOKING REQUESTED</p><h1 className="text-3xl font-bold mt-2">You're all set!</h1><p className="muted mt-2 text-center">{service.name} at {salon.name}<br/>{dates[day].label} · {time}</p><button className="primary-button mt-7" onClick={() => navigate('/app/customer/bookings')}>View my bookings</button></main>

  async function confirm() {
    setBusy(true); setError('')
    try { await createBooking(salon.id, service.id, dates[day].value, time); setDone(true) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to create booking.') }
    finally { setBusy(false) }
  }

  return <main><header className="screen-header page"><button className="icon-button" onClick={() => navigate(-1)} aria-label="Go back"><ChevronLeft/></button><div><p className="eyebrow">NEW APPOINTMENT</p><h1>Book a service</h1></div></header><section className="page"><label className="field-label">Choose salon</label><div className="horizontal-list">{salons.map((item, index) => <button key={item.id} onClick={() => { setSalonIndex(index); setServiceId(item.services[0]?.id ?? '') }} className={salonIndex === index ? 'mini-salon selected' : 'mini-salon'}><span className={`bg-gradient-to-br ${item.color}`}>{item.name[0]}</span><div><strong>{item.name}</strong><small><MapPin size={12}/>{item.area} · <Star size={12}/>{item.rating.toFixed(1)}</small></div></button>)}</div><label className="field-label mt-7">Select service</label><div className="space-y-3">{salon.services.map(item => <button key={item.id} onClick={() => setServiceId(item.id)} className={service.id === item.id ? 'service-row selected' : 'service-row'}><span className="radio">{service.id === item.id && <i/>}</span><div><strong>{item.name}</strong><small><Clock size={13}/>{item.duration} min</small></div><b>₹{item.price}</b></button>)}</div><label className="field-label mt-7">Pick a date</label><div className="date-grid">{dates.map((date, index) => <button key={date.value} onClick={() => setDay(index)} className={day === index ? 'selected' : ''}><CalendarDays size={17}/>{date.label}</button>)}</div><label className="field-label mt-7">Available times</label><div className="time-grid">{times.map(value => <button key={value} onClick={() => setTime(value)} className={time === value ? 'selected' : ''}>{value}</button>)}</div>{error && <p className="form-error mt-4" role="alert">{error}</p>}<div className="booking-bar"><div><small>Total</small><strong>₹{service.price}</strong></div><button onClick={() => void confirm()} disabled={busy}>{busy ? 'Booking…' : 'Confirm booking'}</button></div></section></main>
}
