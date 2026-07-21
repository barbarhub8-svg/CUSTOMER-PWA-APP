import { useState } from 'react'
import { Calendar, Clock, MapPin, Scissors } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCustomerStore } from '../store'

export default function MyBookingsScreen() {
  const { bookings, cancelBooking, loading } = useCustomerStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'Upcoming' | 'Past'>('Upcoming')
  const [error, setError] = useState('')
  const shown = bookings.filter(booking => tab === 'Upcoming' ? booking.status === 'Confirmed' || booking.status === 'Pending' : booking.status !== 'Confirmed' && booking.status !== 'Pending')

  async function cancel(id: string) {
    setError('')
    try { await cancelBooking(id) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to cancel booking.') }
  }

  return <main className="page"><header className="top-title"><p className="eyebrow">YOUR SCHEDULE</p><h1>My bookings</h1></header><div className="tabs"><button className={tab === 'Upcoming' ? 'active' : ''} onClick={() => setTab('Upcoming')}>Upcoming</button><button className={tab === 'Past' ? 'active' : ''} onClick={() => setTab('Past')}>Past</button></div>{error && <p className="form-error mt-4" role="alert">{error}</p>}{loading && <div className="empty"><p>Loading bookings…</p></div>}<div className="space-y-4 mt-5">{shown.map(booking => <article className="booking-card" key={booking.id}><div className="booking-date"><b>{booking.date.slice(8, 10)}</b><span>{booking.date.slice(5, 7)}/{booking.date.slice(0, 4)}</span></div><div className="flex-1"><div className="flex justify-between"><span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span><small>{booking.reference}</small></div><h3>{booking.service}</h3><p><Scissors size={14}/>{booking.salon}</p><p><Clock size={14}/>{booking.time} · ₹{booking.amount}</p><p><MapPin size={14}/>Live booking</p>{(booking.status === 'Confirmed' || booking.status === 'Pending') && <div className="booking-actions"><button onClick={() => void cancel(booking.id)}>Cancel</button><button onClick={() => navigate('/app/customer/book')}>Book another</button></div>}</div></article>)}</div>{!loading && shown.length === 0 && <div className="empty"><Calendar/><h3>No {tab.toLowerCase()} bookings</h3><p>Your live appointments will appear here.</p><button className="primary-button mt-5" onClick={() => navigate('/app/customer/book')}>Book a service</button></div>}</main>
}
