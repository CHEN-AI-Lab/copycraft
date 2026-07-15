import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Only refresh Supabase session for page routes (not API/static)
  if (supabaseUrl && supabaseAnonKey) {
    const { createServerClient } = await import('@supabase/ssr')
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    // Refresh auth session cookie
    await supabase.auth.getUser()

    // Run next-intl middleware (handles locale detection/redirect)
    const intlResponse = intlMiddleware(request)

    // Merge Supabase session cookies into the response
    const finalResponse = intlResponse
    for (const [key, value] of supabaseResponse.headers.entries()) {
      if (key.toLowerCase() === 'set-cookie') {
        finalResponse.headers.append(key, value)
      }
    }

    return finalResponse
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}