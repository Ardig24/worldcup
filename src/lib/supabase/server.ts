import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServerClient() {
  // For TanStack Start, we use the same client on server and client
  return createSupabaseClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
}
