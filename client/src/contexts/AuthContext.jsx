import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

function profileToUser(authUser, profile) {
  const parts = (profile?.name || '').split(' ')
  const firstName = parts[0] || ''
  const lastName = parts.slice(1).join(' ')
  return {
    id: authUser.id,
    email: authUser.email,
    firstName,
    lastName,
    calorieGoal: profile?.calorie_goal ?? 2200,
    proteinGoal: profile?.protein_goal ?? 150,
    carbsGoal:   profile?.carbs_goal   ?? 250,
    fatGoal:     profile?.fat_goal     ?? 70,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    setUser(profileToUser(authUser, profile))
    setLoading(false)
  }

  // Returns { needsConfirmation: true } if email confirmation is required
  async function register({ firstName, lastName, email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    if (data.user) {
      await supabase.from('profiles').insert({
        id:   data.user.id,
        name: `${firstName} ${lastName}`.trim(),
      })
    }

    return { needsConfirmation: !data.session }
  }

  async function login({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function updateUser(updates) {
    const authUpdates = {}
    if (updates.email)    authUpdates.email    = updates.email
    if (updates.password) authUpdates.password = updates.password
    if (Object.keys(authUpdates).length) {
      const { error } = await supabase.auth.updateUser(authUpdates)
      if (error) throw error
    }

    const profileUpdates = {}
    const firstName = updates.firstName ?? user.firstName
    const lastName  = updates.lastName  ?? user.lastName
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      profileUpdates.name = `${firstName} ${lastName}`.trim()
    }
    if (Object.keys(profileUpdates).length) {
      await supabase.from('profiles').update(profileUpdates).eq('id', user.id)
    }

    setUser(prev => ({
      ...prev,
      ...updates,
      firstName: updates.firstName ?? prev.firstName,
      lastName:  updates.lastName  ?? prev.lastName,
    }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
