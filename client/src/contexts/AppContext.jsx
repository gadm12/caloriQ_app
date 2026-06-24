import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getTodayLogs, getTodayLogId, getWeekLogData } from '../services/mealLogsService'
import { getEntriesByLogIds, addFoodEntry, updateFoodEntry, deleteFoodEntry } from '../services/foodEntriesService'
import { updateGoals } from '../services/profilesService'

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

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [entries,  setEntries]  = useState([])
  const [goal,     setGoal]     = useState({ calories: 2200, protein: 150, carbs: 250, fat: 70 })
  const [weekData, setWeekData] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!user) return
    setGoal({
      calories: user.calorieGoal,
      protein:  user.proteinGoal,
      carbs:    user.carbsGoal,
      fat:      user.fatGoal,
    })
  }, [user?.id])

  useEffect(() => {
    if (!user) { setEntries([]); setWeekData([]); return }

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [logs, week] = await Promise.all([
          getTodayLogs(user.id),
          getWeekLogData(user.id),
        ])

        if (logs.length) {
          const rows = await getEntriesByLogIds(logs.map(l => l.id))
          setEntries(rows.map(dbToEntry))
        } else {
          setEntries([])
        }

        setWeekData(week)
      } catch (err) {
        setError(err.message ?? 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.id])

  async function addEntry(entry) {
    setError(null)
    try {
      const logId = await getTodayLogId(user.id)
      const row = await addFoodEntry({
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
      if (row) {
        setEntries(prev => [...prev, dbToEntry(row)])
        setWeekData(prev => prev.map(d => {
          const today = new Date().toISOString().split('T')[0]
          if (d.date !== today) return d
          return {
            ...d,
            calories: d.calories + Number(entry.calories ?? 0),
            protein:  d.protein  + Number(entry.protein  ?? 0),
            carbs:    d.carbs    + Number(entry.carbs    ?? 0),
            fat:      d.fat      + Number(entry.fat      ?? 0),
          }
        }))
      }
    } catch (err) {
      setError(err.message ?? 'Failed to add entry')
      throw err
    }
  }

  async function updateEntry(id, updates) {
    setError(null)
    const dbUpdates = {}
    if (updates.name     !== undefined) dbUpdates.food_name    = updates.name
    if (updates.category !== undefined) dbUpdates.meal_type    = MEAL_TYPE_TO_DB[updates.category] ?? updates.category.toLowerCase()
    if (updates.calories !== undefined) dbUpdates.calories     = updates.calories
    if (updates.protein  !== undefined) dbUpdates.protein      = updates.protein
    if (updates.carbs    !== undefined) dbUpdates.carbs        = updates.carbs
    if (updates.fat      !== undefined) dbUpdates.fat          = updates.fat
    if (updates.serving  !== undefined) dbUpdates.serving_size = parseFloat(updates.serving) || 100

    try {
      await updateFoodEntry(id, dbUpdates)
      setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    } catch (err) {
      setError(err.message ?? 'Failed to update entry')
      throw err
    }
  }

  async function deleteEntry(id) {
    setError(null)
    try {
      await deleteFoodEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err.message ?? 'Failed to delete entry')
      throw err
    }
  }

  async function updateGoal(updates) {
    setError(null)
    const dbUpdates = {}
    if (updates.calories !== undefined) dbUpdates.calorie_goal = updates.calories
    if (updates.protein  !== undefined) dbUpdates.protein_goal = updates.protein
    if (updates.carbs    !== undefined) dbUpdates.carbs_goal   = updates.carbs
    if (updates.fat      !== undefined) dbUpdates.fat_goal     = updates.fat

    try {
      await updateGoals(user.id, dbUpdates)
      setGoal(prev => ({ ...prev, ...updates }))
    } catch (err) {
      setError(err.message ?? 'Failed to save goals')
      throw err
    }
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
    <AppContext.Provider value={{ entries, goal, todayTotals, weekData, loading, error, addEntry, updateEntry, deleteEntry, updateGoal }}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext)
}
