import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <main className="auth-shell"><div className="auth-card"><p>Loading your account…</p></div></main>
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  return children
}
