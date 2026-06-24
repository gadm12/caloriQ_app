import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import ConfirmDialog from './ConfirmDialog'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

const INPUT_CLS = 'w-full px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary text-body-md text-on-surface transition-shadow'
const LABEL_CLS = 'block text-label-md text-on-surface-variant mb-xs'

export default function FoodDetailModal({ entry, onClose }) {
  const { updateEntry, deleteEntry } = useApp()
  const [form, setForm] = useState({
    name:     entry.name,
    category: entry.category,
    serving:  entry.serving,
    calories: entry.calories,
    protein:  entry.protein,
    carbs:    entry.carbs,
    fat:      entry.fat,
  })
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      await updateEntry(entry.id, {
        ...form,
        calories: Number(form.calories),
        protein:  Number(form.protein),
        carbs:    Number(form.carbs),
        fat:      Number(form.fat),
      })
      onClose()
    } catch (err) {
      setSaveError(err.message ?? 'Failed to save changes')
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaveError(null)
    setSaving(true)
    try {
      await deleteEntry(entry.id)
      onClose()
    } catch (err) {
      setSaveError(err.message ?? 'Failed to delete entry')
      setSaving(false)
    }
  }

  return (
    <>
      {showConfirm && (
        <ConfirmDialog
          message={`"${entry.name}" will be permanently removed from your log.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {!showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-md">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-lg py-md bg-surface-container-low border-b border-outline-variant/20">
              <h2 className="font-display font-semibold text-headline-md text-on-surface">Edit Entry</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-lg space-y-md">
              {/* Food Name */}
              <div>
                <label className={LABEL_CLS} htmlFor="modal-name">Food Name</label>
                <input id="modal-name" name="name" value={form.name} onChange={handleChange} required className={INPUT_CLS} />
              </div>

              {/* Category + Serving */}
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className={LABEL_CLS} htmlFor="modal-category">Meal</label>
                  <select id="modal-category" name="category" value={form.category} onChange={handleChange} className={INPUT_CLS}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS} htmlFor="modal-serving">Serving</label>
                  <input id="modal-serving" name="serving" value={form.serving} onChange={handleChange} className={INPUT_CLS} />
                </div>
              </div>

              {/* Calories */}
              <div>
                <label className={LABEL_CLS} htmlFor="modal-calories">Calories (kcal)</label>
                <input id="modal-calories" name="calories" type="number" min="0" value={form.calories} onChange={handleChange} required className={INPUT_CLS} />
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-md">
                <div>
                  <label className={LABEL_CLS} htmlFor="modal-protein">Protein (g)</label>
                  <input id="modal-protein" name="protein" type="number" min="0" value={form.protein} onChange={handleChange} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS} htmlFor="modal-carbs">Carbs (g)</label>
                  <input id="modal-carbs" name="carbs" type="number" min="0" value={form.carbs} onChange={handleChange} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS} htmlFor="modal-fat">Fat (g)</label>
                  <input id="modal-fat" name="fat" type="number" min="0" value={form.fat} onChange={handleChange} className={INPUT_CLS} />
                </div>
              </div>

              {/* Error */}
              {saveError && (
                <div className="flex items-center gap-xs p-sm bg-error-container text-on-error-container rounded-lg text-label-md">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {saveError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-md pt-sm">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-xs px-md py-2 rounded-lg border border-error/40 text-error text-label-md font-semibold hover:bg-error-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Delete
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-on-primary text-label-md font-semibold py-2 rounded-lg shadow-sm hover:bg-surface-tint transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
