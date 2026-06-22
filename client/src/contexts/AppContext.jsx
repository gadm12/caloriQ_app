import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

const MEAL_TYPE_TO_DB = {
  Breakfast: 'breakfast',
  Lunch:     'lunch',
  Dinner:    'dinner',
  Snacks:    'snack',
}
const MEAL_TYPE_FROM_DB = {
  breakfast: 'Breakfast',
  lunch:     'Lunch',
  dinner:    'Dinner',
  snack:     'Snacks',
}

function dbToEntry(row) {
  return {
    id:       row.id,
    name:     row.food_name,
    category: MEAL_TYPE_FROM_DB[row.meal_type] ?? row.meal_type,
    serving:  `${row.serving_size ?? 100}g`,
    calories: Number(row.calories),
    protein:  Number(row.protein  ?? 0),
    carbs:    Number(row.carbs    ?? 0),
    fat:      Number(row.fat      ?? 0),
  }
}

async function getTodayLogId(userId) {
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('meal_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('log_date', today)
    .maybeSingle()

  if (existing) return existing.id

  const { data: newLog } = await supabase
    .from('meal_logs')
    .insert({ user_id: userId, log_date: today })
    .select('id')
    .single()

  return newLog.id
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [goal, setGoal]       = useState({ calories: 2200, protein: 150, carbs: 250, fat: 70 })
  const [loading, setLoading] = useState(false)

  // Sync goal from user profile
  useEffect(() => {
    if (!user) return
    setGoal({
      calories: user.calorieGoal,
      protein:  user.proteinGoal,
      carbs:    user.carbsGoal,
      fat:      user.fatGoal,
    })
  }, [user?.id])

  // Load today's entries
  useEffect(() => {
    if (!user) { setEntries([]); return }

    async function load() {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data: logs } = await supabase
        .from('meal_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('log_date', today)

      if (!logs?.length) { setEntries([]); setLoading(false); return }

      const logIds = logs.map(l => l.id)
      const { data } = await supabase
        .from('food_entries')
        .select('*')
        .in('log_id', logIds)

      setEntries((data ?? []).map(dbToEntry))
      setLoading(false)
    }

    load()
  }, [user?.id])

  async function addEntry(entry) {
    const logId = await getTodayLogId(user.id)
    const { data } = await supabase
      .from('food_entries')
      .insert({
        log_id:       logId,
        user_id:      user.id,
        meal_type:    MEAL_TYPE_TO_DB[entry.category] ?? entry.category.toLowerCase(),
        food_name:    entry.name,
        calories:     entry.calories,
        protein:      entry.protein  || null,
        carbs:        entry.carbs    || null,
        fat:          entry.fat      || null,
        serving_size: parseFloat(entry.serving) || 100,
      })
      .select()
      .single()

    if (data) setEntries(prev => [...prev, dbToEntry(data)])
  }

  async function updateEntry(id, updates) {
    const dbUpdates = {}
    if (updates.name     !== undefined) dbUpdates.food_name    = updates.name
    if (updates.category !== undefined) dbUpdates.meal_type    = MEAL_TYPE_TO_DB[updates.category] ?? updates.category.toLowerCase()
    if (updates.calories !== undefined) dbUpdates.calories     = updates.calories
    if (updates.protein  !== undefined) dbUpdates.protein      = updates.protein
    if (updates.carbs    !== undefined) dbUpdates.carbs        = updates.carbs
    if (updates.fat      !== undefined) dbUpdates.fat          = updates.fat
    if (updates.serving  !== undefined) dbUpdates.serving_size = parseFloat(updates.serving) || 100

    await supabase.from('food_entries').update(dbUpdates).eq('id', id)
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  async function deleteEntry(id) {
    await supabase.from('food_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function updateGoal(updates) {
    const dbUpdates = {}
    if (updates.calories !== undefined) dbUpdates.calorie_goal = updates.calories
    if (updates.protein  !== undefined) dbUpdates.protein_goal = updates.protein
    if (updates.carbs    !== undefined) dbUpdates.carbs_goal   = updates.carbs
    if (updates.fat      !== undefined) dbUpdates.fat_goal     = updates.fat

    await supabase.from('profiles').update(dbUpdates).eq('id', user.id)
    setGoal(prev => ({ ...prev, ...updates }))
  }

  const todayTotals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + Number(e.calories || 0),
      protein:  acc.protein  + Number(e.protein  || 0),
      carbs:    acc.carbs    + Number(e.carbs    || 0),
      fat:      acc.fat      + Number(e.fat      || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <AppContext.Provider value={{ entries, goal, todayTotals, loading, addEntry, updateEntry, deleteEntry, updateGoal }}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext)
}
