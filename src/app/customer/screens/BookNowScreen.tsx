import React, { useMemo, useState } from 'react'
import { CalendarDays, Check, ChevronLeft, Clock, MapPin, Star } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { salons, times } from '../data'
import { useCustomerStore } from '../store'

const BookNowScreen: React.FC = () => {
  const navigate = useNavigate(); const [params] = useSearchParams(); const { addBooking } = useCustomerStore()
  const initialSalon = Math.max(0, salons.findIndex(s => s.id === params.get('salon')))
  const [salonIndex, setSalonIndex] = useState(initialSalon); const salon = salons[salonIndex]
  const [serviceId, setServiceId] = useState(salon.services[0].id); const [day, setDay] = useState(0); const [time, setTime] = useState(times[3]); const [done, setDone] = useState(false)
  const service = useMemo(() => salon.services.find(s => s.id === serviceId) || salon.services[0], [salon, serviceId])
  const dates = ['Today, 21 Jul', 'Wed, 22 Jul', 'Thu, 23 Jul', 'Fri, 24 Jul']
  const pickSalon = (i: number) => { setSalonIndex(i); setServiceId(salons[i].services[0].id) }
  const confirm = () => { addBooking({ id: `NXB-${Math.floor(1000+Math.random()*9000)}`, salon: salon.name, service: service.name, date: dates[day].replace('Today, ', ''), time, amount: service.price, status: 'Confirmed' }); setDone(true) }
  if (done) return <main className="page center-screen"><div className="success-mark"><Check/></div><p className="eyebrow">BOOKING CONFIRMED</p><h1 className="text-3xl font-bold mt-2">You're all set!</h1><p className="muted mt-2 text-center">{service.name} at {salon.name}<br/>{dates[day]} · {time}</p><button className="primary-button mt-7" onClick={() => navigate('/app/customer/bookings')}>View my bookings</button><button className="text-button" onClick={() => navigate('/app/customer')}>Back to home</button></main>
  return <main><header className="screen-header page"><button className="icon-button" onClick={() => navigate(-1)}><ChevronLeft/></button><div><p className="eyebrow">NEW APPOINTMENT</p><h1>Book a service</h1></div></header>
    <section className="page"><label className="field-label">Choose salon</label><div className="horizontal-list">{salons.map((s,i)=><button key={s.id} onClick={()=>pickSalon(i)} className={salonIndex===i?'mini-salon selected':'mini-salon'}><span className={`bg-gradient-to-br ${s.color}`}>{s.name[0]}</span><div><strong>{s.name}</strong><small><MapPin size={12}/>{s.area} · <Star size={12}/>{s.rating}</small></div></button>)}</div>
      <label className="field-label mt-7">Select service</label><div className="space-y-3">{salon.services.map(s=><button key={s.id} onClick={()=>setServiceId(s.id)} className={serviceId===s.id?'service-row selected':'service-row'}><span className="radio">{serviceId===s.id&&<i/>}</span><div><strong>{s.name}</strong><small><Clock size={13}/>{s.duration} min</small></div><b>₹{s.price}</b></button>)}</div>
      <label className="field-label mt-7">Pick a date</label><div className="date-grid">{dates.map((d,i)=><button key={d} onClick={()=>setDay(i)} className={day===i?'selected':''}><CalendarDays size={17}/>{d}</button>)}</div>
      <label className="field-label mt-7">Available times</label><div className="time-grid">{times.map(t=><button key={t} onClick={()=>setTime(t)} className={time===t?'selected':''}>{t}</button>)}</div>
      <div className="booking-bar"><div><small>Total</small><strong>₹{service.price}</strong></div><button onClick={confirm}>Confirm booking</button></div>
    </section>
  </main>
}
export default BookNowScreen
