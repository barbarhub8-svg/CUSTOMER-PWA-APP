import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

export function UpdatePasswordScreen() {
  const { user, passwordRecovery, clearPasswordRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!user && !passwordRecovery) return <Navigate to="/auth" replace />
  if (done) return <Navigate to="/app/customer" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) return setError(updateError.message)
    clearPasswordRecovery()
    setDone(true)
  }

  return <main className="auth-shell"><section className="auth-card">
    <p className="eyebrow">SECURE ACCOUNT</p><h1>Choose a new password</h1>
    <form onSubmit={submit} className="auth-form"><label><span>New password</span><div><input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" /></div></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button auth-submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></form>
  </section></main>
}
