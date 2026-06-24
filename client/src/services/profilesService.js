import { dbClient } from './apiClient'

export async function updateGoals(userId, dbUpdates) {
  const { data } = await dbClient.patch('/profiles', dbUpdates, {
    params: { id: `eq.${userId}` },
  })
  return data[0]
}
