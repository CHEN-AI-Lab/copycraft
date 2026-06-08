import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/checkout
 * Creates a Creem checkout session.
 * No database needed — just verifies login, then creates checkout.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const productId = process.env.CREEM_PRODUCT_ID
    const apiKey = process.env.CREEM_API_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
    }
    if (!productId || !apiKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    // ── Authenticate from server-side session cookie ──────────────
    const { createServerClient } = await import('@supabase/ssr')
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() { /* no write needed */ },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录后再购买', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // ── Read locale from request body ────────────────────────────
    let locale = 'zh-CN'
    try {
      const body = await request.json()
      if (body.locale === 'en') locale = 'en'
    } catch { /* use default */ }

    // ── Build a valid success URL ─────────────────────────────────
    // Creem requires a valid absolute URL for successUrl
    const PRODUCTION_URL = 'https://copycraft-mauve.vercel.app'
    const rawUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const baseUrl = rawUrl.includes('localhost') ? PRODUCTION_URL : (rawUrl || PRODUCTION_URL)
    const successUrl = `${baseUrl.replace(/\/+$/, '')}/${locale}/success`

    console.warn('[checkout] successUrl:', successUrl)

    // ── Create Creem checkout with userId as metadata ────────────
    const { creem } = await import('shared/api')
    const checkout = await creem.checkouts.create({
      productId,
      successUrl,
      metadata: { userId: user.id },
    })

    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout'
    console.error('[checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}