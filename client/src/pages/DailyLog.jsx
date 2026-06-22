import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'
import FoodDetailModal from '../components/FoodDetailModal'

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

function MacroBadge({ label, value, color }) {
  const colors = {
    protein: 'bg-primary/10 text-primary',
    carbs:   'bg-secondary-fixed-dim/20 text-on-secondary-container',
    fat:     'bg-tertiary-container/20 text-on-tertiary-container',
  }
  return (
    <span className={`${colors[color]} px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide`}>
      {value}g {label.charAt(0).toUpperCase()}
    </span>
  )
}

function MacroBar({ label, value, goal, color }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0
  const barColors = {
    protein: 'bg-primary',
    carbs:   'bg-secondary-fixed-dim',
    fat:     'bg-tertiary-container',
  }
  const textColors = {
    protein: 'text-primary',
    carbs:   'text-secondary-fixed-dim',
    fat:     'text-tertiary-container',
  }
  return (
    <div>
      <div className="flex justify-between text-label-md mb-xs">
        <span className={textColors[color]}>{label}</span>
        <span className="text-on-surface">{value}g / {goal}g</span>
      </div>
      <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
        <div className={`h-full ${barColors[color]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function FoodEntryRow({ entry, onEdit, onDeleteRequest }) {
  return (
    <div
      className="group flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-outline-variant/10 last:border-0 cursor-pointer"
      onClick={() => onEdit(entry)}
    >
      <div className="flex-1 min-w-0">
        <h4 className="text-body-md font-semibold text-on-surface truncate">{entry.name}</h4>
        <p className="text-label-md text-on-surface-variant">{entry.serving}</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          <MacroBadge label="protein" value={entry.protein} color="protein" />
          <MacroBadge label="carbs"   value={entry.carbs}   color="carbs"   />
          <MacroBadge label="fat"     value={entry.fat}     color="fat"     />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2 sm:mt-0 flex-shrink-0">
        <span className="font-display font-bold text-stats-number text-on-surface">{entry.calories} kcal</span>
        <div
          className="flex gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low"
            title="Edit"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={() => onDeleteRequest(entry)}
            className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function MealCard({ meal, entries, onEdit, onDeleteRequest, onAdd }) {
  const total = entries.reduce((s, e) => s + Number(e.calories), 0)

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden"
         style={{ boxShadow: '0 4px 20px -2px rgba(107,122,118,0.12)' }}>
      {/* Header */}
      <div className="flex justify-between items-center px-md py-sm bg-surface-container-low border-b border-outline-variant/20">
        <h3 className="font-display font-semibold text-headline-md text-primary">{meal}</h3>
        <span className="font-display font-bold text-stats-number text-on-surface">{total} kcal</span>
      </div>

      {/* Entries */}
      <div className="px-md py-sm flex flex-col gap-0">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] mb-2 opacity-40">restaurant</span>
            <p className="text-body-md">No entries logged yet.</p>
          </div>
        ) : (
          entries.map(entry => (
            <FoodEntryRow
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
            />
          ))
        )}
      </div>

      {/* Add Food */}
      <div className="px-md py-sm bg-surface border-t border-outline-variant/20 text-center">
        <button
          onClick={() => onAdd(meal)}
          className="text-primary text-label-md font-semibold flex items-center justify-center w-full gap-1 hover:text-surface-tint transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Food
        </button>
      </div>
    </div>
  )
}

export default function DailyLog() {
  const { entries, todayTotals, goal } = useApp()
  const navigate = useNavigate()

  const [editEntry, setEditEntry]       = useState(null)
  const [deleteEntry, setDeleteEntry]   = useState(null)
  const { deleteEntry: doDelete }       = useApp()

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const calPct = goal.calories > 0 ? Math.min(100, Math.round((todayTotals.calories / goal.calories) * 100)) : 0

  function handleAdd(meal) {
    navigate(`/log/search?meal=${encodeURIComponent(meal)}`)
  }

  function handleDeleteConfirm() {
    doDelete(deleteEntry.id)
    setDeleteEntry(null)
  }

  return (
    <>
      {/* Modals */}
      {editEntry && (
        <FoodDetailModal entry={editEntry} onClose={() => setEditEntry(null)} />
      )}
      {deleteEntry && !editEntry && (
        <ConfirmDialog
          message={`"${deleteEntry.name}" will be permanently removed from your log.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteEntry(null)}
        />
      )}

      <div className="py-lg space-y-xl">
        {/* Date selector */}
        <section className="flex items-center justify-between bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30"
                 style={{ boxShadow: '0 4px 20px -2px rgba(107,122,118,0.12)' }}>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex flex-col items-center">
            <h2 className="font-display font-semibold text-headline-md text-on-surface">Today</h2>
            <span className="text-label-md text-on-surface-variant">{today}</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors opacity-30 cursor-not-allowed" disabled>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Meal cards */}
          <div className="lg:col-span-2 flex flex-col gap-xl">
            {MEALS.map(meal => (
              <MealCard
                key={meal}
                meal={meal}
                entries={entries.filter(e => e.category === meal)}
                onEdit={setEditEntry}
                onDeleteRequest={setDeleteEntry}
                onAdd={handleAdd}
              />
            ))}
          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30"
                 style={{ boxShadow: '0 4px 20px -2px rgba(107,122,118,0.12)' }}>
              <h3 className="font-display font-semibold text-headline-md text-on-surface mb-md">Daily Total</h3>

              <div className="flex items-end justify-between mb-md">
                <div>
                  <span className="font-display font-bold text-display-lg text-primary">
                    {todayTotals.calories.toLocaleString()}
                  </span>
                  <span className="text-body-md text-on-surface-variant block mt-1">kcal consumed</span>
                </div>
                <div className="text-right">
                  <span className="font-display font-semibold text-headline-md text-on-surface-variant">
                    {goal.calories.toLocaleString()}
                  </span>
                  <span className="text-label-md text-on-surface-variant block">Goal</span>
                </div>
              </div>

              {/* Calorie progress bar */}
              <div className="w-full h-3 bg-surface-variant rounded-full mb-xl overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${calPct}%` }}
                />
              </div>

              <h4 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Macronutrients</h4>
              <div className="space-y-md">
                <MacroBar label="Protein" value={todayTotals.protein} goal={goal.protein} color="protein" />
                <MacroBar label="Carbs"   value={todayTotals.carbs}   goal={goal.carbs}   color="carbs"   />
                <MacroBar label="Fat"     value={todayTotals.fat}      goal={goal.fat}     color="fat"     />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
