import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from 'shared/api'
import { getPrisma } from '../../../../prisma'

/**
 * POST /api/checkout
 * Creates a Creem checkout session.
 * REQUIRES authentication — returns 401 if user is not logged in.
 * User ID comes from the Supabase session cookie, NOT from request body.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const productId = process.env.CREEM_PRODUCT_ID
    const apiKey = process.env.CREEM_API_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Auth not configured' },
        { status: 500 }
      )
    }
    if (!productId || !apiKey) {
      return NextResponse.json(
        { error: 'Payment not configured' },
        { status: 500 }
      )
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

    const userId = user.id

    // ── Ensure user record exists in DB ──────────────────────────
    const prisma = getPrisma()
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: user.email ?? `${userId}@placeholder.local`,
      },
    }).catch(() => { /* ignore race condition */ })

    // ── Read locale from request body ────────────────────────────
    let locale = 'zh-CN'
    try {
      const body = await request.json()
      if (body.locale === 'en') locale = 'en'
    } catch { /* use default */ }

    // ── Create Creem checkout with userId as metadata ────────────
    const { creem } = await import('shared/api')
    const checkout = await creem.checkouts.create({
      productId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://copycraft-mauve.vercel.app'}/${locale}/success`,
      metadata: {
        userId,
      },
    })

    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout'
    if (process.env.NODE_ENV === 'development') {
      console.error('[checkout]', message)
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
