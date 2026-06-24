import { dbClient } from './apiClient'

export async function getEntriesByLogIds(logIds) {
  if (!logIds.length) return []
  const { data } = await dbClient.get('/food_entries', {
    params: {
      select: '*',
      log_id: `in.(${logIds.join(',')})`,
    },
  })
  return data ?? []
}

export async function addFoodEntry(payload) {
  const { data } = await dbClient.post('/food_entries', payload)
  return data[0]
}

export async function updateFoodEntry(id, dbUpdates) {
  const { data } = await dbClient.patch('/food_entries', dbUpdates, {
    params: { id: `eq.${id}` },
  })
  return data[0]
}

export async function deleteFoodEntry(id) {
  await dbClient.delete('/food_entries', {
    params: { id: `eq.${id}` },
    headers: { Prefer: 'return=minimal' },
  })
}
