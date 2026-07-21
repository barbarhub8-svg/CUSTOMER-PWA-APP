import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LockKeyhole, Mail, UserRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

type Mode = 'login' | 'signup' | 'forgot'

export function AuthScreen() {
  const { user } = useAuth()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/app/customer'
    return <Navigate to={from} replace />
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        })
        if (resetError) throw resetError
        setMessage('Password reset link sent. Please check your email.')
      } else if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/app/customer`,
          },
        })
        if (signupError) throw signupError
        if (!data.session) setMessage('Account created. Confirm your email to continue.')
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth-shell">
    <section className="auth-card">
      <div className="brand auth-brand">nexora<span>.</span></div>
      <p className="eyebrow">CUSTOMER ACCOUNT</p>
      <h1>{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}</h1>
      <p className="muted">{mode === 'forgot' ? 'We will email you a secure recovery link.' : 'Book trusted beauty experts near you.'}</p>

      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <label><span>Full name</span><div><UserRound size={18}/><input required value={fullName} onChange={event => setFullName(event.target.value)} autoComplete="name" /></div></label>}
        <label><span>Email</span><div><Mail size={18}/><input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></div></label>
        {mode !== 'forgot' && <label><span>Password</span><div><LockKeyhole size={18}/><input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></div></label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-success" role="status">{message}</p>}
        <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</button>
      </form>

      <div className="auth-links">
        {mode === 'login' && <button onClick={() => setMode('forgot')}>Forgot password?</button>}
        <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>{mode === 'signup' ? 'Already have an account? Sign in' : 'New to Nexora? Create account'}</button>
        {mode === 'forgot' && <button onClick={() => setMode('login')}>Back to sign in</button>}
      </div>
    </section>
  </main>
}
