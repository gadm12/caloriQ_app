import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { mockFoods } from '../data/mockFoods'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

// Parse numeric portion from a serving string like "100g" → 100
function parseServingGrams(serving) {
  const match = serving.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 100
}

// Scale macros based on new serving vs base serving
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

function SearchResult({ food, isExpanded, defaultMeal, onToggle, onAdd }) {
  const [serving, setServing]   = useState(parseServingGrams(food.serving))
  const [meal, setMeal]         = useState(defaultMeal || 'Breakfast')
  const scaled                  = scaleMacros(food, serving)

  function handleAdd() {
    onAdd({
      name:     food.name,
      category: meal,
      serving:  `${serving}g`,
      ...scaled,
    })
  }

  return (
    <li className={`transition-colors ${isExpanded ? 'bg-surface-container-low border-l-4 border-primary' : 'hover:bg-surface-container-low'}`}>
      {/* Collapsed row */}
      <div
        className={`flex justify-between items-center px-md py-md cursor-pointer ${isExpanded ? 'mb-0' : ''}`}
        onClick={onToggle}
      >
        <div>
          <p className={`text-[18px] font-semibold transition-colors ${isExpanded ? 'text-primary font-bold' : 'text-on-surface hover:text-primary'}`}>
            {food.name}
          </p>
          <p className="text-body-md text-on-surface-variant text-sm mt-xs">
            {food.serving} — {scaled.calories} kcal
          </p>
        </div>
        {isExpanded ? (
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            className="w-8 h-8 rounded-full text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </div>

      {/* Expanded form */}
      {isExpanded && (
        <div className="px-md pb-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md p-md bg-surface-container-lowest rounded-lg border border-outline-variant/30">
            {/* Serving size */}
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
                className="w-full px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary text-body-md text-on-surface"
              />
            </div>

            {/* Meal category */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs" htmlFor={`meal-${food.id}`}>
                Meal Category
              </label>
              <select
                id={`meal-${food.id}`}
                value={meal}
                onChange={e => setMeal(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary text-body-md text-on-surface appearance-none"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Computed preview */}
            <div className="md:col-span-2 flex gap-md flex-wrap text-label-md text-on-surface-variant">
              <span className="text-primary font-semibold">{scaled.calories} kcal</span>
              <span>·</span>
              <span>{scaled.protein}g protein</span>
              <span>·</span>
              <span>{scaled.carbs}g carbs</span>
              <span>·</span>
              <span>{scaled.fat}g fat</span>
            </div>

            {/* Add button */}
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
  const [searchParams]      = useSearchParams()
  const defaultMeal         = searchParams.get('meal') || 'Breakfast'
  const [query, setQuery]   = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const { addEntry }        = useApp()
  const navigate            = useNavigate()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return mockFoods
    return mockFoods.filter(f => f.name.toLowerCase().includes(q))
  }, [query])

  function handleAdd(entry) {
    addEntry(entry)
    navigate('/log')
  }

  return (
    <div className="py-lg space-y-xl">
      {/* Header + search */}
      <section className="space-y-md">
        <div className="flex items-center gap-md">
          <button
            onClick={() => navigate('/log')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
            aria-label="Back to log"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-display font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface">Add Food</h1>
        </div>

        <div className="relative w-full max-w-2xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for food..."
            className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-body-md text-on-surface placeholder:text-on-surface-variant transition-shadow"
            autoFocus
          />
        </div>
      </section>

      {/* Results */}
      {results.length > 0 ? (
        <section className="max-w-2xl bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
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
      ) : (
        <div className="max-w-2xl flex flex-col items-center justify-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-md opacity-40">search_off</span>
          <p className="text-body-md">No foods matching &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
