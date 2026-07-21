import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Calendar, Award, User, Search } from 'lucide-react'

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/app/customer', icon: Home, label: 'Home' },
    { to: '/app/customer/book', icon: Search, label: 'Book Now' },
    { to: '/app/customer/bookings', icon: Calendar, label: 'Bookings' },
    { to: '/app/customer/rewards', icon: Award, label: 'Rewards' },
    { to: '/app/customer/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="bottom-nav flex items-center justify-around bg-white py-2 px-1 border-t border-[#dfe7e3]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 text-xs transition-colors tap-target ${
              isActive 
                ? 'text-[#0c8f68]'
                : 'text-[#64748b] hover:text-[#334155]'
            }`
          }
        >
          <item.icon size={22} strokeWidth={2} />
          <span className="mt-0.5 font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
