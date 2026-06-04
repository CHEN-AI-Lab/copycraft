import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../prisma'

/**
 * POST /api/set-vip
 * Set current user as paid (admin only).
 * Usage: visit /api/set-vip after logging in with your admin account.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
    }

    const { createServerClient } = await import('@supabase/ssr')
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() { /* no write needed */ },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const prisma = getPrisma()
    await prisma.user.update({
      where: { id: user.id },
      data: { paid: true },
    })

    return NextResponse.json({ success: true, message: '已设为 VIP' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
