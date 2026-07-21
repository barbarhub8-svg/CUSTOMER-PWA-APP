import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import BookNowScreen from './screens/BookNowScreen'
import MyBookingsScreen from './screens/MyBookingsScreen'
import RewardsScreen from './screens/RewardsScreen'
import ProfileScreen from './screens/ProfileScreen'
import { CustomerStore } from './store'

const CustomerApp: React.FC = () => {
  return (
    <CustomerStore><div className="min-h-screen bg-[#f8fafc] pb-24">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/book" element={<BookNowScreen />} />
        <Route path="/bookings" element={<MyBookingsScreen />} />
        <Route path="/rewards" element={<RewardsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="*" element={<Navigate to="/app/customer" replace />} />
      </Routes>
      
      <BottomNav />
    </div></CustomerStore>
  )
}

export default CustomerApp
