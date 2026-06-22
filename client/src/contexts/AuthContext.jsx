import { createContext, useContext, useRef, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Keyed by email so login() can look up registered names
  const store = useRef({})

  function register({ firstName, lastName, email, password }) {
    const record = { firstName, lastName, email, password }
    store.current[email.toLowerCase()] = record
    setUser(record)
  }

  function login({ email, password }) {
    const stored = store.current[email.toLowerCase()]
    if (stored) {
      setUser(stored)
    } else {
      // Demo fallback: no prior registration in this session
      setUser({ firstName: email.split('@')[0], lastName: '', email, password })
    }
  }

  function logout() {
    setUser(null)
  }

  function updateUser(updates) {
    setUser(prev => {
      const next = { ...prev, ...updates }
      // Keep the store in sync so a re-login gets the updated name
      if (next.email) store.current[next.email.toLowerCase()] = next
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
