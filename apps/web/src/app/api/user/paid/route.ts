import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../../prisma'

/**
 * GET /api/user/paid
 * Checks the current authenticated user's paid status from the database.
 * Expects Supabase session cookie to be present in the request.
 */
export async function GET(request: NextRequest) {
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ paid: false }, { status: 200 })
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() { /* no write needed */ },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ paid: false }, { status: 200 })
    }

    const prisma = getPrisma()
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { paid: true },
    })

    return NextResponse.json({ paid: dbUser?.paid ?? false })
  } catch {
    return NextResponse.json({ paid: false }, { status: 200 })
  }
}
