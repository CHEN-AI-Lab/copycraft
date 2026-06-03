// ─── Generic Supabase Client ─────────────────────────────────────
// Cross-platform: works in Node.js, browser, and serverless runtimes.
// URL + key must be provided by the caller (environment variables).
// Does NOT handle Next.js cookies — that is framework-specific glue
// in apps/*/src/.

import { createClient } from '@supabase/supabase-js'

export type SupabaseEnv = {
  url: string
  anonKey: string
}

/**
 * Create a generic Supabase client.
 * Use this from API routes and server-side code.
 * For browser/client-side code, use `createBrowserClient` from @supabase/ssr.
 */
export function createSupabaseClient(env: SupabaseEnv) {
  return createClient(env.url, env.anonKey)
}
