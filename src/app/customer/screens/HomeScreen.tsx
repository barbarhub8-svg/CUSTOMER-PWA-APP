import React from 'react'
import { Search, Bell, MapPin, Star } from 'lucide-react'

const HomeScreen: React.FC = () => {
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky-header px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="font-outfit text-2xl font-semibold text-[#0f172a]">Nexora</div>
          </div>
          <div className="flex items-center gap-1 text-sm text-[#64748b]">
            <MapPin size={14} /> Jaipur, Rajasthan
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-[#f1f5f9]">
            <Bell size={20} />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-sm font-medium">
            RK
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-4 mt-2">
        <h1 className="text-2xl font-semibold">Good morning, Rahul 👋</h1>
        <p className="text-[#64748b] mt-1">Find and book trusted beauty services near you.</p>
      </div>

      {/* Search Bar */}
      <div className="px-4 mt-5">
        <div className="flex items-center bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3 shadow-sm">
          <Search className="text-[#64748b] mr-3" />
          <input 
            type="text" 
            placeholder="Search salons, services or treatments" 
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#94a3b8]"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="px-4 mt-5">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['Near Me', 'Open Now', 'Top Rated', 'Lowest Price', 'Unisex'].map((filter, i) => (
            <div key={i} className="px-4 py-1.5 bg-white border border-[#e2e8f0] rounded-full text-sm whitespace-nowrap cursor-pointer active:bg-[#f1f5f9]">
              {filter}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Categories</h2>
          <span className="text-[#2563eb] text-sm">See all</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {['Hair Salon', 'Barber', 'Spa', 'Beauty Parlour'].map((cat, idx) => (
            <div key={idx} className="card p-3 text-center cursor-pointer active:scale-[0.985]">
              <div className="w-9 h-9 mx-auto bg-[#f1f5f9] rounded-xl mb-2 flex items-center justify-center">
                <Star size={18} className="text-[#2563eb]" />
              </div>
              <div className="text-xs font-medium">{cat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Salons */}
      <div className="px-4 mt-8">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">Nearby Salons</h2>
          <span className="text-[#2563eb] text-sm">View all</span>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 flex gap-4 cursor-pointer active:bg-[#f8fafc]">
              <div className="w-20 h-20 bg-[#e2e8f0] rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Glamour Studio</div>
                  <div className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Open</div>
                </div>
                <div className="text-sm text-[#64748b]">Vaishali Nagar • 1.2 km</div>
                <div className="flex items-center gap-1 mt-1 text-sm">
                  <Star size={14} className="text-amber-500" /> 4.8 <span className="text-[#64748b]">(124)</span>
                </div>
                <div className="mt-2 text-sm text-[#2563eb]">Starting at ₹299 • Next slot: 2:30 PM</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
