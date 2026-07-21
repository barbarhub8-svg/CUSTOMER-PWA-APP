import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CustomerApp from './app/customer/CustomerApp'
import { AuthScreen } from './auth/AuthScreen'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { UpdatePasswordScreen } from './auth/UpdatePasswordScreen'

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/auth/update-password" element={<UpdatePasswordScreen />} />
      <Route path="/app/customer/*" element={<ProtectedRoute><CustomerApp /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/app/customer" replace />} />
    </Routes>
  )
}

export default App
