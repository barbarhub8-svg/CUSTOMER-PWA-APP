import { useEffect, useState, type ChangeEvent } from 'react'
import { Bell, Camera, ChevronRight, CircleHelp, CreditCard, Heart, LogOut, MapPin, Pencil, ShieldCheck } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useCustomerStore } from '../store'

const menuItems = [
  [Heart, 'My favourites'], [MapPin, 'Saved addresses'], [CreditCard, 'Payments'],
  [Bell, 'Notifications'], [ShieldCheck, 'Privacy & security'], [CircleHelp, 'Help & support'],
] as const

export default function ProfileScreen() {
  const { profile, saveProfile, uploadAvatar, loading } = useCustomerStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { setName(profile?.fullName ?? ''); setMobile(profile?.mobile ?? '') }, [profile])
  const initials = name.split(' ').map(value => value[0]).slice(0, 2).join('').toUpperCase() || 'NX'

  async function save() {
    if (!editing) return setEditing(true)
    setBusy(true); setError('')
    try { await saveProfile(name, mobile); setEditing(false) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save profile.') }
    finally { setBusy(false) }
  }

  async function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true); setError('')
    try { await uploadAvatar(file) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to upload avatar.') }
    finally { setBusy(false); event.target.value = '' }
  }

  if (loading && !profile) return <main className="page center-screen"><p>Loading profile…</p></main>
  return <main className="page"><header className="top-title"><p className="eyebrow">ACCOUNT</p><h1>Profile</h1></header><section className="profile-card"><label className="profile-avatar avatar-upload">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Your avatar"/> : initials}<Camera size={14}/><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void chooseAvatar(event)} /></label><div>{editing ? <><input value={name} onChange={event => setName(event.target.value)} aria-label="Full name" autoFocus/><input value={mobile} onChange={event => setMobile(event.target.value)} aria-label="Mobile number" placeholder="Mobile number" /></> : <><h2>{profile?.fullName || 'Complete your profile'}</h2><p>{profile?.email}</p><span>{profile?.mobile || 'Add mobile number'}</span></>}</div><button onClick={() => void save()} disabled={busy} aria-label={editing ? 'Save profile' : 'Edit profile'}>{editing ? 'Save' : <Pencil size={18}/>}</button></section>{error && <p className="form-error mt-4" role="alert">{error}</p>}<div className="menu">{menuItems.map(([Icon, label]) => <button key={label}><span><Icon size={19}/></span>{label}<ChevronRight size={18}/></button>)}</div><button className="logout" onClick={() => void supabase.auth.signOut()}><LogOut size={18}/>Sign out</button><p className="version">Nexora Customer · Live account</p></main>
}
