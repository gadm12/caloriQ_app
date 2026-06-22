import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const INPUT_CLS = 'w-full border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
const LABEL_CLS = 'block text-label-md text-on-surface-variant mb-xs'

function Field({ id, name, type = 'text', label, value, onChange, required, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLS}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={INPUT_CLS}
      />
    </div>
  )
}

export default function SignInSignUp() {
  const [tab, setTab] = useState('signin')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', confirmEmail: '', password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const { register, login } = useAuth()
  const navigate = useNavigate()

  const isSignUp = tab === 'signup'

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (isSignUp) {
      if (!form.firstName.trim()) return setError('Please enter your first name.')
      if (!form.lastName.trim())  return setError('Please enter your last name.')
      if (form.email !== form.confirmEmail) return setError('Emails do not match.')
      if (form.password.length < 6) return setError('Password must be at least 6 characters.')
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
      register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email, password: form.password })
    } else {
      if (!form.email || !form.password) return setError('Please fill in all fields.')
      login({ email: form.email, password: form.password })
    }

    navigate('/home')
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-pattern opacity-50 z-0 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none" />

      <main className="flex-grow flex flex-col items-center justify-center px-md py-xl z-10 w-full max-w-container-max mx-auto">
        {/* Brand header */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center bg-surface-container-lowest w-16 h-16 rounded-2xl shadow-sm border border-outline-variant/30 mb-md">
            <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
          </div>
          <h1 className="font-display text-display-lg text-primary tracking-tight">CaloriQ</h1>
          <p className="text-body-md text-on-surface-variant mt-sm max-w-[280px] mx-auto">Your expert companion for nutritional vitality.</p>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-lg md:p-8 relative overflow-hidden">
          {/* Tab toggle */}
          <div className="flex bg-surface-container-low rounded-lg p-1 mb-xl relative">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface-container-lowest rounded-md shadow-sm transition-transform duration-300 ease-in-out"
              style={{ transform: isSignUp ? 'translateX(100%)' : 'translateX(0)' }}
            />
            <button type="button" onClick={() => { setTab('signin'); setError('') }}
              className={`flex-1 py-2 text-label-md font-semibold relative z-10 transition-colors duration-300 ${!isSignUp ? 'text-primary' : 'text-on-surface-variant'}`}>
              Sign In
            </button>
            <button type="button" onClick={() => { setTab('signup'); setError('') }}
              className={`flex-1 py-2 text-label-md font-semibold relative z-10 transition-colors duration-300 ${isSignUp ? 'text-primary' : 'text-on-surface-variant'}`}>
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-md">
                <Field id="firstName" name="firstName" label="First Name" value={form.firstName} onChange={handleChange} required autoComplete="given-name" />
                <Field id="lastName"  name="lastName"  label="Last Name"  value={form.lastName}  onChange={handleChange} required autoComplete="family-name" />
              </div>
            )}

            <Field id="email" name="email" type="email" label="Email Address" value={form.email} onChange={handleChange} required autoComplete="email" />

            {isSignUp && (
              <Field id="confirmEmail" name="confirmEmail" type="email" label="Confirm Email" value={form.confirmEmail} onChange={handleChange} required autoComplete="email" />
            )}

            <Field id="password" name="password" type="password" label="Password" value={form.password} onChange={handleChange} required autoComplete={isSignUp ? 'new-password' : 'current-password'} />

            {isSignUp && (
              <Field id="confirmPassword" name="confirmPassword" type="password" label="Confirm Password" value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
            )}

            {!isSignUp && (
              <div className="flex justify-end -mt-sm">
                <a href="#" className="text-label-md text-primary hover:underline transition-colors">Forgot Password?</a>
              </div>
            )}

            {error && (
              <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-on-primary text-label-md font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md hover:bg-surface-tint transition-all active:scale-[0.98] relative overflow-hidden group mt-sm"
            >
              <span className="relative z-10">{isSignUp ? 'Create Account' : 'Sign In'}</span>
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </button>
          </form>

          <div className="mt-xl flex items-center justify-center space-x-4">
            <span className="h-px bg-outline-variant w-full" />
            <span className="text-label-md text-on-surface-variant whitespace-nowrap">Secure Access</span>
            <span className="h-px bg-outline-variant w-full" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="w-full px-md pb-md z-10">
        <footer className="w-full rounded-lg bg-tertiary-container shadow-sm flex flex-col md:flex-row items-center justify-center gap-md p-lg max-w-container-max mx-auto text-center">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 0" }}>volunteer_activism</span>
            <span className="text-body-md text-on-tertiary-container">Help fight hunger around the world</span>
          </div>
          <a href="#" className="underline font-bold text-on-tertiary-container text-label-md hover:opacity-90 transition-opacity">Donate Now</a>
        </footer>
      </div>
    </div>
  )
}
