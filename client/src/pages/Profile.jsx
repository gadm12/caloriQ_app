import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function Field({ label, type = 'text', value, onChange, autoComplete }) {
  return (
    <div className="flex flex-col gap-xs">
      <label className="text-label-md text-on-surface-variant">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  )
}

function getInitials(user) {
  if (!user) return '?'
  const first = user.firstName?.charAt(0) || ''
  const last  = user.lastName?.charAt(0)  || ''
  return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName,  setLastName]  = useState(user?.lastName  || '')
  const [email,     setEmail]     = useState(user?.email     || '')

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')

  const [profileSaved, setProfileSaved] = useState(false)
  const [pwSaved,      setPwSaved]      = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [pwSaving,      setPwSaving]      = useState(false)

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileSaving(true)
    try {
      const updates = { firstName: firstName.trim(), lastName: lastName.trim() }
      if (email !== user.email) updates.email = email
      await updateUser(updates)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (err) {
      alert(err.message ?? 'Failed to save profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    setPwError('')
    if (pwForm.next.length < 6) { setPwError('New password must be at least 6 characters.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return }

    setPwSaving(true)
    try {
      // Re-authenticate to verify the current password before updating
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email:    user.email,
        password: pwForm.current,
      })
      if (reAuthError) { setPwError('Current password is incorrect.'); return }

      await updateUser({ password: pwForm.next })
      setPwForm({ current: '', next: '', confirm: '' })
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 2500)
    } catch (err) {
      setPwError(err.message ?? 'Failed to update password.')
    } finally {
      setPwSaving(false)
    }
  }

  const initials    = getInitials(user)
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || ''

  return (
    <div className="py-xl space-y-xl">

      {/* Header */}
      <section className="flex items-center gap-md">
        <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-display font-bold text-[24px] shadow-sm select-none">
          {initials}
        </div>
        <div>
          <h1 className="font-display font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface">
            {displayName}
          </h1>
          <p className="text-body-md text-on-surface-variant">{user?.email}</p>
        </div>
      </section>

      {/* Account info */}
      <form onSubmit={handleProfileSave} className="space-y-md">
        <div
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg space-y-md"
          style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
        >
          <div className="flex items-center gap-sm mb-sm">
            <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <h2 className="font-display font-semibold text-headline-md text-on-surface">Account Info</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <Field label="First Name" value={firstName} onChange={setFirstName} autoComplete="given-name" />
            <Field label="Last Name"  value={lastName}  onChange={setLastName}  autoComplete="family-name" />
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        </div>

        <div className="flex items-center gap-md">
          <button type="submit" disabled={profileSaving}
            className="px-lg py-sm bg-primary text-on-primary text-label-md font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-60">
            {profileSaving ? 'Saving…' : 'Save Changes'}
          </button>
          {profileSaved && (
            <div className="flex items-center gap-xs text-primary">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-label-md font-semibold">Saved!</span>
            </div>
          )}
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handlePasswordSave} className="space-y-md">
        <div
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg space-y-md"
          style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
        >
          <div className="flex items-center gap-sm mb-sm">
            <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <h2 className="font-display font-semibold text-headline-md text-on-surface">Change Password</h2>
          </div>

          <Field label="Current Password" type="password" value={pwForm.current}
            onChange={v => setPwForm(p => ({ ...p, current: v }))} autoComplete="current-password" />
          <Field label="New Password" type="password" value={pwForm.next}
            onChange={v => setPwForm(p => ({ ...p, next: v }))} autoComplete="new-password" />
          <Field label="Confirm New Password" type="password" value={pwForm.confirm}
            onChange={v => setPwForm(p => ({ ...p, confirm: v }))} autoComplete="new-password" />

          {pwError && (
            <div className="flex items-center gap-xs text-error">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span className="text-label-md">{pwError}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-md">
          <button type="submit" disabled={pwSaving}
            className="px-lg py-sm bg-primary text-on-primary text-label-md font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-60">
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
          {pwSaved && (
            <div className="flex items-center gap-xs text-primary">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-label-md font-semibold">Password updated!</span>
            </div>
          )}
        </div>
      </form>

      {/* Sign out */}
      <div
        className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg flex items-center justify-between gap-md"
        style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
      >
        <div>
          <h2 className="font-display font-semibold text-headline-md text-on-surface">Sign Out</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">You'll be returned to the login screen.</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="px-lg py-sm bg-error-container text-on-error-container text-label-md font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
        >
          Sign Out
        </button>
      </div>

    </div>
  )
}
