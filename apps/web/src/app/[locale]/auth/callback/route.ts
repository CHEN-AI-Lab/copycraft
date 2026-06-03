import { NextRequest, NextResponse } from 'next/server'

// Supabase OAuth callback — exchanges auth code for session
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const { createServerClient } = await import('@supabase/ssr')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
        },
      },
    })

    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in
  const url = new URL(next, origin)
  // Preserve locale from the callback URL path
  const pathParts = request.nextUrl.pathname.split('/')
  const locale = pathParts[1] === 'en' || pathParts[1] === 'zh-CN' ? pathParts[1] : 'zh-CN'
  url.pathname = `/${locale}${next.startsWith('/') ? '' : '/'}${next}`

  return NextResponse.redirect(url)
}