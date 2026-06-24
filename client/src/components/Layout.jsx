import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DonateFooter from './DonateFooter'

function getInitials(user) {
  if (!user) return '?'
  const first = user.firstName?.charAt(0) || ''
  const last  = user.lastName?.charAt(0)  || ''
  return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
}

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard',   label: 'Dashboard' },
  { to: '/log',       icon: 'menu_book',   label: 'Log'       },
  { to: '/log/search',icon: 'add_circle',  label: 'Add'       },
  { to: '/progress',  icon: 'insights',    label: 'Progress'  },
  { to: '/profile',   icon: 'person',      label: 'Profile'   },
]

const DESKTOP_NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/log',       label: 'Log',  end: true },
  { to: '/log/search',label: 'Add'   },
  { to: '/progress',  label: 'Progress' },
  { to: '/goals',     label: 'Goals' },
  { to: '/contact',   label: 'Contact' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = getInitials(user)

  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-surface shadow-sm w-full">
        <div className="flex justify-between items-center px-md py-sm w-full max-w-container-max mx-auto">
          <div className="flex items-center gap-lg">
            <NavLink to="/home" className="flex items-center gap-sm">
              <span
                className="material-symbols-outlined text-primary text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                nutrition
              </span>
              <span className="font-display font-bold text-headline-md text-primary">CaloriQ</span>
            </NavLink>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-sm">
              {DESKTOP_NAV.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `text-label-md font-semibold px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-primary bg-surface-container-low'
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-sm">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                {dark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate('/profile')}
              aria-label="Go to profile"
              className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold text-sm shadow-sm select-none hover:opacity-80 transition-opacity"
            >
              {initials}
            </button>

            {/* Sign out (desktop only) */}
            <button
              onClick={() => { logout(); navigate('/') }}
              aria-label="Sign out"
              className="hidden md:flex items-center gap-xs text-label-md text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content — pad bottom on mobile for fixed nav */}
      <div className="flex-1 pb-24 md:pb-0 w-full max-w-container-max mx-auto px-md md:px-lg">
        <Outlet />
      </div>

      {/* Donate footer */}
      <div className="px-md w-full">
        <DonateFooter />
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest rounded-t-xl shadow-lg flex justify-around items-center pt-2 pb-4 px-2">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/log'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-3 py-1 transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container rounded-full'
                  : 'text-on-surface-variant'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                <span className="text-[10px] font-semibold tracking-wide mt-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
