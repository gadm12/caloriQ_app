import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

// Generate a simple unique id
let _id = 1
function nextId() { return _id++ }

export function AppProvider({ children }) {
  const [entries, setEntries] = useState([])
  const [goal, setGoal] = useState({ calories: 2200, protein: 150, carbs: 250, fat: 70 })

  function addEntry(entry) {
    setEntries(prev => [...prev, { ...entry, id: nextId() }])
  }

  function updateEntry(id, updates) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function updateGoal(updates) {
    setGoal(prev => ({ ...prev, ...updates }))
  }

  const todayTotals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + Number(e.calories || 0),
      protein: acc.protein + Number(e.protein || 0),
      carbs: acc.carbs + Number(e.carbs || 0),
      fat: acc.fat + Number(e.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <AppContext.Provider value={{ entries, goal, todayTotals, addEntry, updateEntry, deleteEntry, updateGoal }}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext)
}
