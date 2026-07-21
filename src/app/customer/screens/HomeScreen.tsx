import { useMemo, useState } from 'react'
import { Bell, ChevronRight, Heart, MapPin, Scissors, Search, Sparkles, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCustomerStore } from '../store'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { salons, categories, favourites, toggleFavourite, profile, loading, error, refresh } = useCustomerStore()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const shown = useMemo(() => salons.filter(salon => (filter === 'All' || (filter === 'Open Now' && salon.open) || (filter === 'Top Rated' && salon.rating >= 4.8)) && `${salon.name} ${salon.category} ${salon.services.map(service => service.name)}`.toLowerCase().includes(query.toLowerCase())), [filter, query, salons])
  const firstName = profile?.fullName.split(' ')[0] || 'there'
  const initials = profile?.fullName.split(' ').map(value => value[0]).slice(0, 2).join('').toUpperCase() || 'NX'

  return <main>
    <header className="sticky-header page flex items-center justify-between py-3"><div><div className="brand">nexora<span>.</span></div><button className="location"><MapPin size={14}/> {profile?.mobile ? 'Your area' : 'Choose location'} <ChevronRight size={14}/></button></div><div className="flex gap-2"><button className="icon-button relative" aria-label="Notifications"><Bell size={20}/></button><div className="avatar">{initials}</div></div></header>
    <section className="page pt-5"><p className="eyebrow">HELLO, {firstName.toUpperCase()}</p><h1 className="hero-title">Your best look,<br/><span>one tap away.</span></h1><p className="muted mt-2">Trusted beauty experts near you.</p><div className="search-box mt-6"><Search size={20}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search salons or services" aria-label="Search salons or services" /></div><div className="chips mt-3">{['All', 'Open Now', 'Top Rated'].map(value => <button key={value} onClick={() => setFilter(value)} className={filter === value ? 'chip active' : 'chip'}>{value}</button>)}</div></section>
    <section className="page mt-7"><div className="section-heading"><h2>Explore services</h2><button onClick={() => navigate('/app/customer/book')}>See all</button></div><div className="category-grid">{categories.slice(0, 4).map((category, index) => <button key={category} onClick={() => setQuery(category)} className="category-card"><span>{index % 2 ? <Scissors/> : <Sparkles/>}</span>{category}</button>)}</div></section>
    <section className="page mt-8"><div className="section-heading"><h2>Popular near you</h2><span>{shown.length} places</span></div>
      {loading && <div className="empty"><p>Loading live salons…</p></div>}
      {error && <div className="empty"><h3>Could not load salons</h3><p>{error}</p><button className="primary-button mt-5" onClick={() => void refresh()}>Try again</button></div>}
      {!loading && !error && <div className="space-y-4">{shown.map(salon => <article key={salon.id} className="salon-card" onClick={() => navigate(`/app/customer/book?salon=${salon.id}`)}><div className={`salon-cover bg-gradient-to-br ${salon.color}`} style={salon.coverImageUrl ? { backgroundImage: `url(${salon.coverImageUrl})`, backgroundSize: 'cover' } : undefined}><span>{salon.name.slice(0, 1)}</span><button onClick={event => { event.stopPropagation(); void toggleFavourite(salon.id) }} aria-label={favourites.includes(salon.id) ? `Remove ${salon.name} from favourites` : `Add ${salon.name} to favourites`}><Heart size={18} fill={favourites.includes(salon.id) ? 'currentColor' : 'none'}/></button></div><div className="p-4"><div className="flex justify-between gap-3"><div><h3>{salon.name}</h3><p>{salon.category} · {salon.area}</p></div><span className={salon.open ? 'open' : 'closed'}>{salon.open ? 'Open' : 'Closed'}</span></div><div className="salon-meta"><span><Star size={15} fill="currentColor"/> {salon.rating.toFixed(1)} ({salon.reviews})</span><strong>From ₹{Math.min(...salon.services.map(service => service.price))}</strong></div></div></article>)}</div>}
      {!loading && !error && shown.length === 0 && <div className="empty"><Search/><h3>No live salons yet</h3><p>Approved salons and services will appear here automatically.</p></div>}
    </section>
  </main>
}
