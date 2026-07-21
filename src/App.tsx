import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CustomerApp from './app/customer/CustomerApp'

function App() {
  return (
    <Routes>
      <Route path="/app/customer/*" element={<CustomerApp />} />
      <Route path="*" element={<Navigate to="/app/customer" replace />} />
    </Routes>
  )
}

export default App
