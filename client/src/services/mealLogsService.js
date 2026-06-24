import { dbClient } from './apiClient'

export async function getTodayLogId(userId) {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await dbClient.get('/meal_logs', {
    params: {
      select: 'id',
      user_id: `eq.${userId}`,
      log_date: `eq.${today}`,
    },
    headers: { Prefer: 'return=representation' },
  })

  if (existing?.length) return existing[0].id

  const { data: created } = await dbClient.post('/meal_logs', {
    user_id: userId,
    log_date: today,
  })

  return created[0].id
}

export async function getTodayLogs(userId) {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await dbClient.get('/meal_logs', {
    params: {
      select: 'id',
      user_id: `eq.${userId}`,
      log_date: `eq.${today}`,
    },
  })
  return data ?? []
}

export async function getWeekLogData(userId) {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 6)

  const todayStr = today.toISOString().split('T')[0]
  const startStr = startDate.toISOString().split('T')[0]

  const { data: logs } = await dbClient.get('/meal_logs', {
    params: {
      select: 'id,log_date',
      user_id: `eq.${userId}`,
      log_date: [`gte.${startStr}`, `lte.${todayStr}`],
    },
  })

  // Build a date→{calories,protein,carbs,fat} map
  const dateMap = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    dateMap[d.toISOString().split('T')[0]] = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  }

  if (!logs?.length) {
    return Object.entries(dateMap).map(([date, macros]) => ({ date, ...macros }))
  }

  const logIdToDate = {}
  for (const log of logs) logIdToDate[log.id] = log.log_date

  const ids = logs.map(l => l.id).join(',')
  const { data: entries } = await dbClient.get('/food_entries', {
    params: {
      select: 'calories,protein,carbs,fat,log_id',
      log_id: `in.(${ids})`,
    },
  })

  for (const entry of entries ?? []) {
    const date = logIdToDate[entry.log_id]
    if (!date || !dateMap[date]) continue
    dateMap[date].calories += Number(entry.calories ?? 0)
    dateMap[date].protein  += Number(entry.protein  ?? 0)
    dateMap[date].carbs    += Number(entry.carbs    ?? 0)
    dateMap[date].fat      += Number(entry.fat      ?? 0)
  }

  return Object.entries(dateMap).map(([date, macros]) => ({ date, ...macros }))
}
