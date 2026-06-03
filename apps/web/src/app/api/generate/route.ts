import { NextRequest, NextResponse } from 'next/server'
import { parseVersions, formatVersion, buildSystemPrompt, buildUserPrompt, getMaxTokens } from 'shared'
import { generationRequestSchema } from 'shared'
import { getPrisma } from '../../../../prisma'

export async function POST(request: NextRequest) {
  // ── Parse & validate request ──
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = generationRequestSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return NextResponse.json({ error: firstError.message }, { status: 400 })
  }

  const { prompt, platform, locale, tone, length, template, maxTokens, versionCount } = parsed.data

  // ── Auth check — enforce paid status ──
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() { /* no write needed */ },
        },
      })
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const prisma = getPrisma()
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { paid: true },
        })

        // Logged-in but not paid — block, free tier is tracked on frontend via localStorage
        if (!(dbUser?.paid ?? false)) {
          return NextResponse.json(
            { error: '请先付费解锁无限使用 / Please upgrade to Pro' },
            { status: 403 }
          )
        }
      }
      // Not logged in → free tier, let it through (frontend enforces daily limit via localStorage)
    }
  } catch {
    // Supabase not configured — fall through (no auth, no enforcement)
  }

  // ── Build prompt ──
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://token.sensenova.cn/v1'
  const model = process.env.OPENAI_MODEL || 'sensenova-6.7-flash-lite'
  const tokens = maxTokens || getMaxTokens(length)
  const count = versionCount || 3
  const system = buildSystemPrompt({ locale, platform, tone, length, versionCount: count })
  const userMessage = buildUserPrompt(locale, prompt)

  // ── Call LLM (non-streaming) ──
  const llmRes = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
      max_tokens: tokens,
      temperature: 0.8,
      stream: false,
    }),
  })

  if (!llmRes.ok) {
    const errText = await llmRes.text()
    return NextResponse.json({ error: `API error: ${errText}` }, { status: 500 })
  }

  const data = await llmRes.json()
  const raw = data.choices?.[0]?.message?.content || ''

  if (!raw.trim()) {
    return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 })
  }

  const versionList = parseVersions(raw)

  if (versionList.length === 0) {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // Format versions
  const formatted = versionList.map((v: { title?: string; body?: string; tags?: string[] }) =>
    formatVersion(v, length === 'short')
  )
  const result = formatted.slice(0, count)

  // ── Log generation ──
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() { /* no write needed */ },
        },
      })
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const prisma = getPrisma()
        await prisma.generationLog.create({
          data: {
            userId: user.id,
            platform,
            template: template ?? null,
            tone,
            length,
          },
        }).catch(() => { /* non-blocking */ })
      }
    }
  } catch { /* non-blocking */ }

  return NextResponse.json({ versions: result })
}
