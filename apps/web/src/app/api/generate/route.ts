import { NextRequest, NextResponse } from 'next/server'

const platformNames: Record<string, string> = {
  general: 'general social media',
  wechat: 'WeChat Moments (朋友圈)',
  xiaohongshu: 'Xiaohongshu (小红书)',
  weibo: 'Weibo (微博)',
  zhihu: 'Zhihu (知乎)',
  douyin: 'Douyin (抖音)',
}

const toneInstructions: Record<string, string> = {
  normal: '语气自然流畅',
  humorous: '语气幽默风趣，可以用网络梗和轻松的表达',
  emotional: '语气煽情感人，能打动人心',
  concise: '简洁有力，一句话说清楚核心',
  formal: '语气正式专业，适合商务场合',
}

function extractCopy(raw: string): string {
  // The model outputs thinking process (mostly English) followed by actual copy (Chinese + emoji).
  // Strategy: find the last meaningful block with Chinese text.
  const lines = raw.split('\n')
  const chineseLineIdx: number[] = []

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return
    // Check for Chinese characters
    if (/[\u4e00-\u9fff]/.test(trimmed)) {
      chineseLineIdx.push(i)
    }
  })

  if (chineseLineIdx.length === 0) {
    // No Chinese at all - return raw (might be English copy)
    return raw.trim()
  }

  // The actual copy usually starts near the last block of Chinese lines
  // Find the last sequence of consecutive Chinese lines
  let lastBlockStart = chineseLineIdx[0]
  let currentBlockStart = chineseLineIdx[0]

  for (let i = 1; i < chineseLineIdx.length; i++) {
    if (chineseLineIdx[i] - chineseLineIdx[i - 1] <= 2) {
      // Same block
    } else {
      // New block starts
      currentBlockStart = chineseLineIdx[i]
    }
    lastBlockStart = currentBlockStart
  }

  // Take from the start of the last Chinese block to the end
  const result = lines.slice(lastBlockStart).join('\n').trim()

  // Clean up any remaining thinking artifacts within the result
  return result
    .split('\n')
    .filter((l) => {
      const t = l.trim()
      // Remove remaining English-only lines (thinking artifacts)
      if (!/[\u4e00-\u9fff]/.test(t) && t.length > 10) {
        if (/^[*\d\s]/.test(t)) return false
        return false
      }
      return true
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform, locale, tone, maxTokens } = await req.json()

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1'
    const model = process.env.OPENAI_MODEL || 'deepseek-chat'
    const platformStr = platformNames[platform as string] || '社交媒体'
    const toneStr = toneInstructions[tone as string] || toneInstructions.normal

    const systemPrompt = locale === 'zh-CN'
      ? `你是一个文案写手。${toneStr}。平台：${platformStr}\n直接输出文案。`
      : `You are a copywriter. Tone: ${toneStr.replace('语气', '').trim() || 'natural'}.\nPlatform: ${platformStr}\nOutput copy only.`

    const userPrompt = locale === 'zh-CN'
      ? `关键词/想法：${prompt}`
      : `Keywords/ideas: ${prompt}`

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens || 500,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('AI API error:', response.status, errBody)
      return NextResponse.json({ error: `AI API error: ${response.status}` }, { status: 502 })
    }

    const data = await response.json()
    const message = data.choices?.[0]?.message
    const rawText = message?.content || message?.reasoning || ''

    const text = extractCopy(rawText)

    return NextResponse.json({ text })
  } catch (e) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}