import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

// ─── Macro progress bar ────────────────────────────────────────────────────────
function MacroRow({ label, consumed, goal, barColor }) {
  const pct = goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0
  return (
    <div>
      <div className="flex justify-between text-label-md mb-xs">
        <span className="text-on-surface">{label}</span>
        <span className="text-on-surface-variant">{consumed} / {goal}g</span>
      </div>
      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Meal snapshot card ────────────────────────────────────────────────────────
function MealSnapshotCard({ meal, entries, onAdd }) {
  const total = entries.reduce((s, e) => s + Number(e.calories), 0)
  const isEmpty = entries.length === 0
  const preview = entries.length > 0
    ? entries[0].name + (entries.length > 1 ? ` +${entries.length - 1} more` : '')
    : null

  return (
    <div
      className={`rounded-lg p-md hover:shadow-md transition-shadow relative bg-surface-bright
        ${isEmpty
          ? 'border-2 border-dashed border-outline-variant/50 bg-surface-dim/20'
          : 'border border-outline-variant/30'
        }`}
    >
      <div className="flex justify-between items-start mb-md">
        <div>
          <h3 className="text-label-md text-on-surface font-semibold">{meal}</h3>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {isEmpty ? 'Add food' : `${total} kcal`}
          </p>
        </div>
        <button
          onClick={() => onAdd(meal)}
          className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm
            ${isEmpty
              ? 'bg-primary text-on-primary'
              : 'bg-primary-container text-on-primary-container'
            }`}
          aria-label={`Add food to ${meal}`}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
      {preview && (
        <p className="text-sm text-on-surface leading-snug truncate">{preview}</p>
      )}
    </div>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const { todayTotals, goal, entries } = useApp()
  const navigate = useNavigate()

  const { calories: consumed } = todayTotals
  const calPct     = goal.calories > 0 ? Math.min(100, Math.round((consumed / goal.calories) * 100)) : 0
  const remaining  = goal.calories - consumed
  const isOver     = remaining < 0

  const firstName  = user?.firstName || user?.email?.split('@')[0] || 'there'

  function handleAddMeal(meal) {
    navigate(`/log/search?meal=${encodeURIComponent(meal)}`)
  }

  return (
    <div className="py-xl space-y-xl">
      {/* Greeting */}
      <section>
        <h1 className="font-display font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Hello, {firstName} 👋
        </h1>
        <p className="text-body-md text-on-surface-variant mt-sm">Let's stay on track today.</p>
      </section>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-md">

        {/* ── Daily calorie summary (8/12) ── */}
        <section
          className="md:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg flex flex-col justify-between"
          style={{ boxShadow: '0 4px 24px -8px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-start justify-between mb-lg">
            <div>
              <h2 className="font-display font-semibold text-headline-md text-on-surface mb-xs">Daily Summary</h2>
              <p className="text-body-md text-on-surface-variant">
                Daily goal:{' '}
                <span className="font-semibold text-on-surface">{goal.calories.toLocaleString()} kcal</span>
              </p>
            </div>
            <Link
              to="/goals"
              className="flex items-center gap-xs text-label-md text-on-surface-variant hover:text-primary transition-colors flex-shrink-0 mt-xs"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span className="hidden sm:inline">Set Goal</span>
            </Link>
          </div>

          <div className="flex flex-col gap-sm">
            {/* Numbers */}
            <div className="flex justify-between items-end">
              <div className="flex items-baseline gap-xs">
                <span className="font-display font-bold text-display-lg text-primary leading-none">
                  {consumed.toLocaleString()}
                </span>
                <span className="text-body-md text-on-surface-variant">
                  / {goal.calories.toLocaleString()} kcal
                </span>
              </div>
              <span className={`font-display font-bold text-stats-number ${isOver ? 'text-error' : 'text-tertiary-container'}`}>
                {isOver
                  ? `${Math.abs(remaining).toLocaleString()} kcal over`
                  : `${remaining.toLocaleString()} kcal left`
                }
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-4 bg-surface-container-high rounded-full overflow-hidden shadow-inner relative">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${isOver ? 'bg-error' : 'bg-primary'}`}
                style={{ width: `${calPct}%` }}
              />
            </div>
          </div>
        </section>

        {/* ── Macros (4/12) ── */}
        <section
          className="md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg"
          style={{ boxShadow: '0 4px 24px -8px rgba(0,0,0,0.08)' }}
        >
          <h2 className="font-display font-semibold text-headline-md text-on-surface mb-lg">Macros</h2>
          <div className="flex flex-col gap-md">
            <MacroRow label="Protein" consumed={todayTotals.protein} goal={goal.protein} barColor="bg-primary" />
            <MacroRow label="Carbs"   consumed={todayTotals.carbs}   goal={goal.carbs}   barColor="bg-secondary-container" />
            <MacroRow label="Fat"     consumed={todayTotals.fat}      goal={goal.fat}     barColor="bg-tertiary-container" />
          </div>
        </section>

        {/* ── Today's Meals (12/12) ── */}
        <section
          className="md:col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg"
          style={{ boxShadow: '0 4px 24px -8px rgba(0,0,0,0.08)' }}
        >
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-display font-semibold text-headline-md text-on-surface">Today's Meals</h2>
            <Link
              to="/log"
              className="text-primary text-label-md font-semibold hover:underline transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {MEALS.map(meal => (
              <MealSnapshotCard
                key={meal}
                meal={meal}
                entries={entries.filter(e => e.category === meal)}
                onAdd={handleAddMeal}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
