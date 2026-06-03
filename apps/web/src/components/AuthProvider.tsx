'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User, UserSession } from 'shared'

// ─── Auth Context ────────────────────────────────────────────────
// Provides Supabase session state to all client components.
// The Supabase client is created here (browser-safe) and the session
// is kept in sync via onAuthStateChange. Paid status is fetched from
// the server to override the default `paid: false`.

interface AuthContextValue extends UserSession {
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserSession>({ user: null, loading: true })

  // ── Fetch paid status from server ──────────────────────────────
  // This is called after we have a user session and overrides the
  // default `paid: false` from mapUser with the DB value.
  const fetchPaidStatus = useCallback(async (_userId: string) => {
    try {
      const res = await fetch('/api/user/paid')
      const data = await res.json()
      return data.paid === true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let unsub: (() => void) | undefined

    async function init() {
      // Lazy-load @supabase/ssr — browser-safe, wrapped in try/catch
      try {
        const { createBrowserClient } = await import('@supabase/ssr')
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          if (!cancelled) setState({ user: null, loading: false })
          return
        }

        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        if (!cancelled) {
          const user = session?.user ? mapUser(session.user) : null
          // Fetch paid status from server for logged-in users
          if (user) {
            const paid = await fetchPaidStatus(user.id)
            if (!cancelled) {
              setState({ user: { ...user, paid }, loading: false })
            }
          } else {
            setState({ user: null, loading: false })
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!cancelled) {
            const user = session?.user ? mapUser(session.user) : null
            if (user) {
              const paid = await fetchPaidStatus(user.id)
              if (!cancelled) {
                setState({ user: { ...user, paid }, loading: false })
              }
            } else {
              setState({ user: null, loading: false })
            }
          }
        })

        unsub = () => subscription.unsubscribe()
      } catch {
        if (!cancelled) setState({ user: null, loading: false })
      }
    }

    init()

    return () => {
      cancelled = true
      unsub?.()
    }
  }, [fetchPaidStatus])

  const signOut = useCallback(async () => {
    try {
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
        await supabase.auth.signOut()
      }
    } catch { /* ignore */ }
    setState({ user: null, loading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useUser(): UserSession & { signOut: () => Promise<void> } {
  return useContext(AuthContext)
}

function mapUser(supabaseUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: (supabaseUser.user_metadata?.full_name as string) ?? null,
    avatarUrl: (supabaseUser.user_metadata?.avatar_url as string) ?? null,
    paid: false, // Default — will be overridden by fetchPaidStatus after login
    createdAt: '',
  }
}