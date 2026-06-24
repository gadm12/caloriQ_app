import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

// Returns Mon–Sun dates for the week containing `date`
function getWeekDates(date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun … 6=Sat
  const mon = new Date(d)
  mon.setDate(d.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(mon)
    dt.setDate(mon.getDate() + i)
    return dt
  })
}

function fmt(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Mock weekly data (used when preview toggle is on)
const MOCK_WEEK = [2050, 1980, 2680, 2300, 1850, 1600, 0]

// ─── Bar chart ────────────────────────────────────────────────────────────────
function CalChart({ dayData, goal }) {
  const peak = Math.max(...dayData, goal, 1)
  const goalPct = (goal / peak) * 100
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="relative" style={{ height: '256px' }}>
      {/* Goal reference line */}
      <div
        className="absolute left-0 right-0 border-t border-dashed border-tertiary-container z-0 flex justify-end"
        style={{ bottom: `${goalPct}%` }}
      >
        <span className="text-label-md text-tertiary-container -translate-y-5 pr-1">Goal</span>
      </div>

      {/* Bars */}
      <div className="absolute inset-0 flex items-end justify-between gap-2 md:gap-4 z-10">
        {dayData.map((cal, i) => {
          const barPct = peak > 0 ? (cal / peak) * 100 : 0
          const over = cal > goal
          const empty = cal === 0

          return (
            <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
              <div className="w-full flex flex-col justify-end" style={{ height: `${barPct}%` }}>
                {!empty && (
                  <div
                    title={`${cal} kcal`}
                    className={`w-full rounded-t-sm transition-all duration-700 group-hover:opacity-80 ${
                      over ? 'bg-tertiary-container' : 'bg-primary'
                    }`}
                    style={{ height: '100%' }}
                  />
                )}
              </div>
              <span className="text-label-md text-on-surface-variant mt-sm">{DAY_LABELS[i]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Macro avg tile ───────────────────────────────────────────────────────────
function MacroTile({ icon, label, value, borderColor, iconColor }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-md flex flex-col items-center text-center">
      <div
        className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-sm border-4"
        style={{ borderColor }}
      >
        <span className="material-symbols-outlined" style={{ color: iconColor }}>{icon}</span>
      </div>
      <span className="text-stats-number font-bold text-on-surface">{value}g</span>
      <span className="text-label-md text-on-surface-variant">{label}</span>
    </div>
  )
}

// ─── Progress page ────────────────────────────────────────────────────────────
export default function Progress() {
  const { goal, weekData } = useApp()
  const [useMock, setUseMock] = useState(false)

  const today = new Date()
  const weekDates = getWeekDates(today)

  // Build per-day calorie data from real weekData, aligned to Mon–Sun
  const realDayData = weekDates.map(d => {
    const key = d.toISOString().split('T')[0]
    const found = weekData.find(w => w.date === key)
    return found ? Math.round(found.calories) : 0
  })

  const dayData = useMock ? MOCK_WEEK : realDayData

  const daysLogged = dayData.filter(c => c > 0).length
  const totalLogged = dayData.reduce((s, c) => s + c, 0)
  const avgCalories = daysLogged > 0 ? Math.round(totalLogged / daysLogged) : 0
  const avgPct = goal.calories > 0 ? Math.min(100, Math.round((avgCalories / goal.calories) * 100)) : 0

  // Consistency message
  const consistencyMsg =
    daysLogged === 0 ? 'No entries logged this week yet.' :
    daysLogged <= 2  ? 'Getting started — keep it up!' :
    daysLogged <= 4  ? 'Solid progress this week.' :
    daysLogged <= 6  ? 'Goal met most of the week. Great job!' :
    'Perfect week — every day logged!'

  // Weekly macro averages from real weekData
  const realMacroAvg = (() => {
    const daysWithData = weekData.filter(d => d.calories > 0)
    if (!daysWithData.length) return { protein: 0, carbs: 0, fat: 0 }
    return {
      protein: Math.round(daysWithData.reduce((s, d) => s + d.protein, 0) / daysWithData.length),
      carbs:   Math.round(daysWithData.reduce((s, d) => s + d.carbs,   0) / daysWithData.length),
      fat:     Math.round(daysWithData.reduce((s, d) => s + d.fat,     0) / daysWithData.length),
    }
  })()

  const macroAvg = useMock ? { protein: 124, carbs: 240, fat: 65 } : realMacroAvg

  const dateRange = `${fmt(weekDates[0])} – ${fmt(weekDates[6])}`

  return (
    <div className="py-xl space-y-xl">

      {/* Header */}
      <section className="flex flex-col gap-sm">
        <h1 className="font-display font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Weekly Progress
        </h1>
        <p className="text-body-md text-on-surface-variant">{dateRange}</p>
      </section>

      {/* Mock data toggle */}
      <div className="flex items-center gap-sm">
        <button
          onClick={() => setUseMock(v => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            useMock ? 'bg-primary' : 'bg-outline-variant'
          }`}
          aria-label="Toggle preview data"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              useMock ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-label-md text-on-surface-variant">Preview with sample week</span>
      </div>

      {/* Consistency + Average */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-md">

        {/* Consistency */}
        <div
          className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 flex items-center justify-between"
          style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
        >
          <div>
            <h3 className="text-label-md text-on-surface-variant mb-xs">Consistency Score</h3>
            <div className="flex items-baseline gap-xs">
              <span className="font-display font-bold text-display-lg text-primary">{daysLogged}</span>
              <span className="text-stats-number text-on-surface-variant">/7 Days</span>
            </div>
            <p className="text-body-md text-on-surface-variant mt-sm">{consistencyMsg}</p>
          </div>
          <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-4xl text-on-primary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
        </div>

        {/* Average intake */}
        <div
          className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30"
          style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
        >
          <h3 className="text-label-md text-on-surface-variant mb-xs">Average Daily Intake</h3>
          <div className="flex items-baseline gap-xs mb-sm">
            <span className="font-display font-bold text-display-lg text-on-surface">
              {avgCalories > 0 ? avgCalories.toLocaleString() : '—'}
            </span>
            <span className="text-stats-number text-on-surface-variant">kcal</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-700"
              style={{ width: `${avgPct}%` }}
            />
          </div>
          <p className="text-label-md text-on-surface-variant mt-sm text-right">
            Target: {goal.calories.toLocaleString()} kcal
          </p>
        </div>

      </section>

      {/* Bar chart */}
      <section
        className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30"
        style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
      >
        <div className="flex justify-between items-center mb-lg">
          <h2 className="font-display font-semibold text-headline-md text-on-surface">Intake vs Goal</h2>
          <span className="text-label-md px-3 py-1 bg-surface-container-low text-on-surface-variant rounded-full">
            This Week
          </span>
        </div>

        <CalChart dayData={dayData} goal={goal.calories} />
      </section>

      {/* Weekly macro averages */}
      <section
        className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30"
        style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
      >
        <h2 className="font-display font-semibold text-headline-md text-on-surface mb-lg">Weekly Averages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <MacroTile
            icon="egg_alt"
            label="Protein"
            value={macroAvg.protein}
            borderColor="#006b5f"
            iconColor="#006b5f"
          />
          <MacroTile
            icon="bakery_dining"
            label="Carbs"
            value={macroAvg.carbs}
            borderColor="#86f2e4"
            iconColor="#006f66"
          />
          <MacroTile
            icon="water_drop"
            label="Fats"
            value={macroAvg.fat}
            borderColor="#ffad3a"
            iconColor="#855300"
          />
        </div>
      </section>

    </div>
  )
}
