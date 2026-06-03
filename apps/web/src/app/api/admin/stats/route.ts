import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../../prisma'

export async function GET(request: NextRequest) {
  try {
    // ── Auth ──
    const { createServerClient } = await import('@supabase/ssr')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
    }
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() { /* no write needed */ },
      },
    })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // ── Admin check ──
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
    if (!adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const prisma = getPrisma()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // ── Stats ──
    const [totalUsers, paidUsers, todayGenerations, totalGenerations] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { paid: true } }),
      prisma.generationLog.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.generationLog.count(),
    ])

    // ── Users with generation counts ──
    const rawUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const userIds = rawUsers.map(u => u.id)
    const genCounts = await prisma.generationLog.groupBy({
      by: ['userId'],
      _count: { id: true },
      _max: { createdAt: true },
      where: { userId: { in: userIds } },
    })

    const genMap = new Map(genCounts.map(g => [g.userId, {
      count: g._count.id,
      last: g._max.createdAt,
    }]))

    const users = rawUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      paid: u.paid,
      createdAt: u.createdAt.toISOString(),
      lastGenerate: genMap.get(u.id)?.last?.toISOString() ?? null,
      generationCount: genMap.get(u.id)?.count ?? 0,
    }))

    // ── Daily trend (last 14 days) ──
    const fourteenDaysAgo = new Date(todayStart.getTime() - 14 * 24 * 60 * 60 * 1000)
    const rawTrend = await prisma.generationLog.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const trendMap = new Map<string, number>()
    for (let i = 0; i < 14; i++) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000)
      trendMap.set(d.toISOString().slice(0, 10), 0)
    }
    for (const g of rawTrend) {
      const key = g.createdAt.toISOString().slice(0, 10)
      trendMap.set(key, (trendMap.get(key) || 0) + 1)
    }

    const dailyTrend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    return NextResponse.json({
      totalUsers,
      paidUsers,
      todayGenerations,
      totalGenerations,
      users,
      dailyTrend,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}