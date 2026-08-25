import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getCleanUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqjgcmjgyndtkwejtuqp.supabase.co'
  const cleaned = raw.replace(/["'\r\n\s]/g, '').trim()
  return cleaned.startsWith('http') ? cleaned : 'https://tqjgcmjgyndtkwejtuqp.supabase.co'
}

function getCleanKey(key?: string): string {
  if (!key) return ''
  return key.replace(/["'\r\n\s]/g, '').trim()
}

const supabaseUrl = getCleanUrl()
const supabaseAnonKey = getCleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const supabaseServiceKey = getCleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY)

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || 'dummy-anon-key-for-build'
)

export const supabaseAdmin: SupabaseClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase

export function getSupabaseStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
