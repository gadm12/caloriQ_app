import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { mockFoods } from '../data/mockFoods'
import { searchFoods } from '../services/openFoodFacts'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

function parseServingGrams(serving) {
  const match = serving.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 100
}

function scaleMacros(food, newServingG) {
  const baseG = parseServingGrams(food.serving)
  const ratio = baseG > 0 ? newServingG / baseG : 1
  return {
    calories: Math.round(food.calories * ratio),
    protein:  Math.round(food.protein  * ratio),
    carbs:    Math.round(food.carbs    * ratio),
    fat:      Math.round(food.fat      * ratio),
  }
}

// Shared input/select classes — includes explicit dark: bg so dark mode doesn't rely on CSS overrides
const fieldCls = 'w-full px-3 py-2 bg-surface-container dark:bg-[#243a39] rounded-lg border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary text-body-md text-on-surface dark:text-[#d8efec]'

function CustomFoodForm({ defaultMeal, onAdd, onClose }) {
  const empty = { name: '', serving: '100', calories: '', protein: '', carbs: '', fat: '', category: defaultMeal }
  const [f, setF] = useState(empty)

  function set(key) {
    return e => setF(prev => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!f.name.trim() || !f.calories) return
    onAdd({
      name:     f.name.trim(),
      category: f.category,
      serving:  `${f.serving || 100}g`,
      calories: Number(f.calories),
      protein:  Number(f.protein)  || 0,
      carbs:    Number(f.carbs)    || 0,
      fat:      Number(f.fat)      || 0,
    })
  }

  return (
    <div className="max-w-2xl bg-surface-container-lowest dark:bg-[#182423] rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-md pt-md pb-sm border-b border-outline-variant/20">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            edit_note
          </span>
          <p className="font-semibold text-on-surface dark:text-[#d8efec]">Custom food</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container dark:hover:bg-[#243a39] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-md p-md">
        {/* Name — full width */}
        <div className="md:col-span-2">
          <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor="custom-name">
            Food name <span className="text-error">*</span>
          </label>
          <input
            id="custom-name"
            type="text"
            required
            placeholder="e.g. Protein bar"
            value={f.name}
            onChange={set('name')}
            className={fieldCls}
          />
        </div>

        {/* Serving + Calories */}
        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor="custom-serving">
            Serving size (g)
          </label>
          <input
            id="custom-serving"
            type="number"
            min="1"
            value={f.serving}
            onChange={set('serving')}
            className={fieldCls}
          />
        </div>

        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor="custom-calories">
            Calories (kcal) <span className="text-error">*</span>
          </label>
          <input
            id="custom-calories"
            type="number"
            min="0"
            required
            placeholder="0"
            value={f.calories}
            onChange={set('calories')}
            className={fieldCls}
          />
        </div>

        {/* Macros */}
        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor="custom-protein">
            Protein (g)
          </label>
          <input id="custom-protein" type="number" min="0" placeholder="0" value={f.protein} onChange={set('protein')} className={fieldCls} />
        </div>

        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor="custom-carbs">
            Carbs (g)
          </label>
          <input id="custom-carbs" type="number" min="0" placeholder="0" value={f.carbs} onChange={set('carbs')} className={fieldCls} />
        </div>

        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor="custom-fat">
            Fat (g)
          </label>
          <input id="custom-fat" type="number" min="0" placeholder="0" value={f.fat} onChange={set('fat')} className={fieldCls} />
        </div>

        {/* Meal category */}
        <div>
          <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor="custom-category">
            Meal category
          </label>
          <select id="custom-category" value={f.category} onChange={set('category')} className={`${fieldCls} appearance-none`}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Submit — full width */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full py-3 bg-primary text-on-primary text-label-md font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-surface-tint transition-all active:scale-[0.98]"
          >
            Add to Log
          </button>
        </div>
      </form>
    </div>
  )
}

function SearchResult({ food, isExpanded, defaultMeal, onToggle, onAdd }) {
  const [serving, setServing] = useState(parseServingGrams(food.serving))
  const [meal, setMeal]       = useState(defaultMeal || 'Breakfast')
  const scaled                = scaleMacros(food, serving)

  function handleAdd() {
    onAdd({
      name:     food.name,
      category: meal,
      serving:  `${serving}g`,
      ...scaled,
    })
  }

  return (
    <li className={`transition-colors ${
      isExpanded
        ? 'bg-surface-container-low dark:bg-[#1e2f2e] border-l-4 border-primary'
        : 'hover:bg-surface-container-low dark:hover:bg-[#1e2f2e]'
    }`}>
      {/* Collapsed row */}
      <div
        className="flex justify-between items-center px-md py-md cursor-pointer"
        onClick={onToggle}
      >
        <div>
          <p className={`text-[18px] font-semibold transition-colors ${
            isExpanded ? 'text-primary font-bold' : 'text-on-surface dark:text-[#d8efec] hover:text-primary'
          }`}>
            {food.name}
          </p>
          <p className="text-body-md text-on-surface-variant text-sm mt-xs">
            {food.serving} — {scaled.calories} kcal
          </p>
        </div>
        {isExpanded ? (
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            className="w-8 h-8 rounded-full text-on-surface-variant flex items-center justify-center hover:bg-surface-container dark:hover:bg-[#243a39] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            className="w-10 h-10 rounded-full bg-surface-container-high dark:bg-[#2c4847] text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </div>

      {/* Expanded form */}
      {isExpanded && (
        <div className="px-md pb-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md p-md bg-surface-container-lowest dark:bg-[#182423] rounded-lg border border-outline-variant/30">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor={`serving-${food.id}`}>
                Serving Size (g)
              </label>
              <input
                id={`serving-${food.id}`}
                type="number"
                min="1"
                value={serving}
                onChange={e => setServing(Math.max(1, Number(e.target.value)))}
                className={fieldCls}
              />
            </div>

            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor={`meal-${food.id}`}>
                Meal Category
              </label>
              <select
                id={`meal-${food.id}`}
                value={meal}
                onChange={e => setMeal(e.target.value)}
                className={`${fieldCls} appearance-none`}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-md flex-wrap text-label-md text-on-surface-variant">
              <span className="text-primary font-semibold">{scaled.calories} kcal</span>
              <span>·</span>
              <span>{scaled.protein}g protein</span>
              <span>·</span>
              <span>{scaled.carbs}g carbs</span>
              <span>·</span>
              <span>{scaled.fat}g fat</span>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleAdd}
                className="w-full py-3 bg-primary text-on-primary text-label-md font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-surface-tint transition-all active:scale-[0.98]"
              >
                Add to Log
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

export default function SearchFood() {
  const [searchParams]              = useSearchParams()
  const defaultMeal                 = searchParams.get('meal') || 'Breakfast'
  const [query, setQuery]           = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [results, setResults]       = useState(mockFoods)
  const [status, setStatus]         = useState('idle') // 'idle' | 'loading' | 'error'
  const [showCustom, setShowCustom] = useState(false)
  const { addEntry }                = useApp()
  const navigate                    = useNavigate()

  async function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      setResults(mockFoods)
      setStatus('idle')
      return
    }
    setStatus('loading')
    try {
      const data = await searchFoods(q)
      setResults(data)
      setStatus('idle')
    } catch {
      setStatus('error')
      setResults([])
    }
  }

  function handleAdd(entry) {
    addEntry(entry)
    navigate('/log')
  }

  return (
    <div className="py-lg space-y-lg">
      {/* Header */}
      <div className="flex items-center gap-md">
        <button
          onClick={() => navigate('/log')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-[#1e2f2e] text-on-surface-variant transition-colors"
          aria-label="Back to log"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-display font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface">Add Food</h1>
      </div>

      {/* Search bar + custom button */}
      <section className="space-y-sm max-w-2xl">
        <form onSubmit={handleSearch} className="flex gap-sm w-full">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for food..."
              className="w-full pl-12 pr-4 py-3 bg-surface-container dark:bg-[#243a39] rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-body-md text-on-surface dark:text-[#d8efec] placeholder:text-on-surface-variant transition-shadow"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-md py-3 bg-primary text-on-primary text-label-md font-semibold rounded-xl shadow-sm hover:shadow-md hover:bg-surface-tint transition-all active:scale-[0.98] whitespace-nowrap"
          >
            Search
          </button>
        </form>

        {/* Custom food toggle */}
        <button
          type="button"
          onClick={() => setShowCustom(v => !v)}
          className="flex items-center gap-xs text-label-md text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            {showCustom ? 'remove' : 'add'}
          </span>
          {showCustom ? 'Cancel custom entry' : "Can't find it? Add custom food"}
        </button>
      </section>

      {/* Custom food form */}
      {showCustom && (
        <CustomFoodForm
          defaultMeal={defaultMeal}
          onAdd={handleAdd}
          onClose={() => setShowCustom(false)}
        />
      )}

      {/* API results */}
      {status === 'loading' && (
        <div className="max-w-2xl flex items-center gap-md py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
          <p className="text-body-md">Searching…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="max-w-2xl flex flex-col items-center justify-center py-16 text-error">
          <span className="material-symbols-outlined text-[48px] mb-md opacity-60">wifi_off</span>
          <p className="text-body-md">Could not reach Open Food Facts. Check your connection.</p>
        </div>
      )}

      {status !== 'loading' && results.length > 0 && (
        <section className="max-w-2xl bg-surface-container-lowest dark:bg-[#182423] rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <ul className="divide-y divide-outline-variant/20">
            {results.map(food => (
              <SearchResult
                key={food.id}
                food={food}
                isExpanded={expandedId === food.id}
                defaultMeal={defaultMeal}
                onToggle={() => setExpandedId(prev => prev === food.id ? null : food.id)}
                onAdd={handleAdd}
              />
            ))}
          </ul>
        </section>
      )}

      {status !== 'loading' && results.length === 0 && query.trim() && (
        <div className="max-w-2xl flex flex-col items-center justify-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-md opacity-40">search_off</span>
          <p className="text-body-md">No foods matching &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
