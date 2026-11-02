import { createClient } from '@supabase/supabase-js'

// Current Supabase key naming: the *publishable* key (sb_publishable_...) is the
// browser-safe key. The legacy `anon` key still works on older projects, but new
// code should use the publishable key. The secret key is server-only and must
// never appear here. See SUPABASE_SETUP.md.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  // Fail loudly in dev rather than silently inserting against a placeholder
  // project, which would swallow every submission. Production builds surface
  // the form's on-brand error state instead of crashing the page.
  console.error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local (see SUPABASE_SETUP.md).'
  )
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabasePublishableKey ?? ''
)
