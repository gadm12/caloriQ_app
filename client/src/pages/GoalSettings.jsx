import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

function NumberField({ label, value, onChange, unit, min = 0 }) {
  return (
    <div className="flex flex-col gap-xs">
      <label className="text-label-md text-on-surface-variant">{label}</label>
      <div className="relative flex items-center">
        <input
          type="number"
          min={min}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full border border-outline-variant rounded-lg px-md py-sm pr-12 text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {unit && (
          <span className="absolute right-md text-label-md text-on-surface-variant pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

export default function GoalSettings() {
  const { goal, updateGoal } = useApp()

  const [form, setForm] = useState({
    calories: goal.calories,
    protein: goal.protein,
    carbs: goal.carbs,
    fat: goal.fat,
  })
  const [saved, setSaved] = useState(false)

  function set(field) {
    return val => setForm(prev => ({ ...prev, [field]: val }))
  }

  function handleSave(e) {
    e.preventDefault()
    updateGoal(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // Estimated calories from macros
  const estimatedCal = Math.round(form.protein * 4 + form.carbs * 4 + form.fat * 9)

  return (
    <div className="py-xl space-y-xl">

      {/* Header */}
      <section>
        <h1 className="font-display font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Goal Settings
        </h1>
        <p className="text-body-md text-on-surface-variant mt-sm">
          Set your daily calorie and macro targets. Changes apply immediately across the app.
        </p>
      </section>

      <form onSubmit={handleSave} className="space-y-md">

        {/* Calorie goal */}
        <div
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg space-y-md"
          style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
        >
          <div className="flex items-center gap-sm mb-sm">
            <span
              className="material-symbols-outlined text-primary text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <h2 className="font-display font-semibold text-headline-md text-on-surface">Daily Calorie Goal</h2>
          </div>

          <NumberField
            label="Calories"
            value={form.calories}
            onChange={set('calories')}
            unit="kcal"
            min={500}
          />
        </div>

        {/* Macro targets */}
        <div
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg space-y-md"
          style={{ boxShadow: '0 4px 20px rgba(107,122,118,0.08)' }}
        >
          <div className="flex items-center gap-sm mb-sm">
            <span
              className="material-symbols-outlined text-primary text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              nutrition
            </span>
            <h2 className="font-display font-semibold text-headline-md text-on-surface">Macro Targets</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            <NumberField label="Protein" value={form.protein} onChange={set('protein')} unit="g" />
            <NumberField label="Carbohydrates" value={form.carbs} onChange={set('carbs')} unit="g" />
            <NumberField label="Fat" value={form.fat} onChange={set('fat')} unit="g" />
          </div>

          {/* Estimated calories hint */}
          <div className="flex items-center gap-sm pt-xs border-t border-outline-variant/20">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">info</span>
            <p className="text-label-md text-on-surface-variant">
              Estimated calories from macros: <span className="text-on-surface">{estimatedCal.toLocaleString()} kcal</span>
            </p>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-md">
          <button
            type="submit"
            className="px-lg py-sm bg-primary text-on-primary text-label-md font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            Save Changes
          </button>

          {saved && (
            <div className="flex items-center gap-xs text-primary">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="text-label-md font-semibold">Saved!</span>
            </div>
          )}
        </div>

      </form>
    </div>
  )
}
