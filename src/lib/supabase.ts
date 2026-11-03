import { createClient } from '@supabase/supabase-js'

// Current Supabase key naming: the *publishable* key (sb_publishable_...) is the
// browser-safe key. The legacy `anon` key still works on older projects, but new
// code should use the publishable key. The secret key is server-only and must
// never appear here. See SUPABASE_SETUP.md.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

if (!isSupabaseConfigured) {
  // IMPORTANT: never let missing env vars crash the whole site. createClient()
  // throws "supabaseUrl is required" on an empty string, which happens at import
  // time and leaves a blank white page. We warn instead and fall back to a
  // placeholder client; the contact form's try/catch then shows its normal
  // "Could not send" message until the env vars are set.
  console.warn(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (.env.local locally, Project Settings > Environment Variables on Vercel).'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-key'
)
