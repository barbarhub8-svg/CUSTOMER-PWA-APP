import React, { useState } from 'react'
import { Calendar, Clock, MapPin, Scissors } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCustomerStore } from '../store'

const MyBookingsScreen: React.FC = () => {
 const { bookings, cancelBooking } = useCustomerStore(); const navigate=useNavigate(); const [tab,setTab]=useState<'Upcoming'|'Past'>('Upcoming')
 const shown=bookings.filter(b=>tab==='Upcoming'?b.status==='Confirmed':b.status!=='Confirmed')
 return <main className="page"><header className="top-title"><p className="eyebrow">YOUR SCHEDULE</p><h1>My bookings</h1></header><div className="tabs"><button className={tab==='Upcoming'?'active':''} onClick={()=>setTab('Upcoming')}>Upcoming</button><button className={tab==='Past'?'active':''} onClick={()=>setTab('Past')}>Past</button></div><div className="space-y-4 mt-5">{shown.map(b=><article className="booking-card" key={b.id}><div className="booking-date"><b>{b.date.split(' ')[0]}</b><span>{b.date.split(' ').slice(1).join(' ')}</span></div><div className="flex-1"><div className="flex justify-between"><span className={`status ${b.status.toLowerCase()}`}>{b.status}</span><small>{b.id}</small></div><h3>{b.service}</h3><p><Scissors size={14}/>{b.salon}</p><p><Clock size={14}/>{b.time} · ₹{b.amount}</p><p><MapPin size={14}/>Jaipur, Rajasthan</p>{b.status==='Confirmed'&&<div className="booking-actions"><button onClick={()=>cancelBooking(b.id)}>Cancel</button><button onClick={()=>navigate('/app/customer/book')}>Reschedule</button></div>}</div></article>)}</div>{shown.length===0&&<div className="empty"><Calendar/><h3>No {tab.toLowerCase()} bookings</h3><p>Your appointments will appear here.</p><button className="primary-button mt-5" onClick={()=>navigate('/app/customer/book')}>Book a service</button></div>}</main>
}
export default MyBookingsScreen
