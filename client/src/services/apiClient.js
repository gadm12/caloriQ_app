import axios from 'axios'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// PostgREST requires repeated keys for multiple filters on the same column:
//   log_date=gte.X&log_date=lte.Y   (NOT log_date[]=gte.X&log_date[]=lte.Y)
function postgrestSerializer(params) {
  const parts = []
  for (const [key, val] of Object.entries(params)) {
    const values = Array.isArray(val) ? val : [val]
    for (const v of values) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
    }
  }
  return parts.join('&')
}

export const dbClient = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  paramsSerializer: { serialize: postgrestSerializer },
})

dbClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  config.headers.Authorization = `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}`
  return config
})

export const offClient = axios.create({
  baseURL: 'https://world.openfoodfacts.org',
})
