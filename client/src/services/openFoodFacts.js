const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl'

/**
 * Search Open Food Facts and return cleaned food items.
 * All macro values are normalised to per-100g so the caller can scale
 * them by serving size without any additional conversion.
 *
 * @param {string} query
 * @param {number} [pageSize=20]
 * @returns {Promise<Array<{id, name, serving, calories, protein, carbs, fat}>>}
 */
export async function searchFoods(query, pageSize = 20) {
  const params = new URLSearchParams({
    search_terms:  query,
    search_simple: '1',
    action:        'process',
    json:          '1',
    page_size:     String(pageSize),
    fields:        'id,product_name,nutriments',
    lc:            'en',
    cc:            'us',
  })

  const res = await fetch(`${SEARCH_URL}?${params}`)
  if (!res.ok) throw new Error(`Open Food Facts request failed: ${res.status}`)

  const { products = [] } = await res.json()

  return products
    .filter(p => p.product_name?.trim() && p.nutriments?.['energy-kcal_100g'] != null)
    .map(p => ({
      id:       p.id ?? p._id ?? crypto.randomUUID(),
      name:     p.product_name.trim(),
      serving:  '100g',
      calories: Math.round(p.nutriments['energy-kcal_100g']      ?? 0),
      protein:  Math.round(p.nutriments['proteins_100g']         ?? 0),
      carbs:    Math.round(p.nutriments['carbohydrates_100g']    ?? 0),
      fat:      Math.round(p.nutriments['fat_100g']              ?? 0),
    }))
}
