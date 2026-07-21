import React, { useMemo, useState } from 'react'
import { Bell, ChevronRight, Heart, MapPin, Scissors, Search, Sparkles, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { categories, salons } from '../data'
import { useCustomerStore } from '../store'

const HomeScreen: React.FC = () => {
  const navigate = useNavigate(); const { favourites, toggleFavourite } = useCustomerStore()
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All')
  const shown = useMemo(() => salons.filter(s => (filter === 'All' || (filter === 'Open Now' && s.open) || (filter === 'Top Rated' && s.rating >= 4.8)) && `${s.name} ${s.category} ${s.services.map(v => v.name)}`.toLowerCase().includes(query.toLowerCase())), [query, filter])
  return <main>
    <header className="sticky-header page flex items-center justify-between py-3"><div><div className="brand">nexora<span>.</span></div><button className="location"><MapPin size={14}/> Jaipur, Rajasthan <ChevronRight size={14}/></button></div><div className="flex gap-2"><button className="icon-button relative" aria-label="Notifications"><Bell size={20}/><i className="notification-dot"/></button><div className="avatar">RK</div></div></header>
    <section className="page pt-5"><p className="eyebrow">GOOD MORNING, RAHUL</p><h1 className="hero-title">Your best look,<br/><span>one tap away.</span></h1><p className="muted mt-2">Trusted beauty experts near you.</p>
      <div className="search-box mt-6"><Search size={20}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search salons or services"/></div>
      <div className="chips mt-3">{['All','Open Now','Top Rated'].map(x => <button key={x} onClick={() => setFilter(x)} className={filter === x ? 'chip active' : 'chip'}>{x}</button>)}</div>
    </section>
    <section className="page mt-7"><div className="section-heading"><h2>Explore services</h2><button onClick={() => navigate('/app/customer/book')}>See all</button></div><div className="category-grid">{categories.map((c,i) => <button key={c} onClick={() => {setQuery(c); navigate('/app/customer/book')}} className="category-card"><span>{i % 2 ? <Scissors/> : <Sparkles/>}</span>{c}</button>)}</div></section>
    <section className="page mt-8"><div className="section-heading"><h2>Popular near you</h2><span>{shown.length} places</span></div><div className="space-y-4">{shown.map(s => <article key={s.id} className="salon-card" onClick={() => navigate(`/app/customer/book?salon=${s.id}`)}><div className={`salon-cover bg-gradient-to-br ${s.color}`}><span>{s.name.slice(0,1)}</span><button onClick={e => {e.stopPropagation();toggleFavourite(s.id)}} aria-label="Favourite"><Heart size={18} fill={favourites.includes(s.id) ? 'currentColor' : 'none'}/></button></div><div className="p-4"><div className="flex justify-between gap-3"><div><h3>{s.name}</h3><p>{s.category} · {s.area}</p></div><span className={s.open ? 'open' : 'closed'}>{s.open ? 'Open' : 'Closed'}</span></div><div className="salon-meta"><span><Star size={15} fill="currentColor"/> {s.rating} ({s.reviews})</span><span>{s.distance}</span><strong>From ₹{Math.min(...s.services.map(v=>v.price))}</strong></div></div></article>)}</div>{shown.length===0 && <div className="empty"><Search/><h3>No matches found</h3><p>Try another salon or service.</p></div>}</section>
  </main>
}
export default HomeScreen
