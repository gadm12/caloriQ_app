import { offClient } from './apiClient'

export async function searchFoods(query, pageSize = 20) {
  const res = await offClient.get('/cgi/search.pl', {
    params: {
      search_terms:  query,
      search_simple: '1',
      action:        'process',
      json:          '1',
      page_size:     String(pageSize),
      fields:        'id,product_name,nutriments',
      lc:            'en',
      cc:            'us',
    },
  })

  const { products = [] } = res.data

  return products
    .filter(p => p.product_name?.trim() && p.nutriments?.['energy-kcal_100g'] != null)
    .map(p => ({
      id:       p.id ?? p._id ?? crypto.randomUUID(),
      name:     p.product_name.trim(),
      serving:  '100g',
      calories: Math.round(p.nutriments['energy-kcal_100g']   ?? 0),
      protein:  Math.round(p.nutriments['proteins_100g']      ?? 0),
      carbs:    Math.round(p.nutriments['carbohydrates_100g'] ?? 0),
      fat:      Math.round(p.nutriments['fat_100g']           ?? 0),
    }))
}
