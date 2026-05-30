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

function hasEmoji(text: string): boolean {
  const emojiRanges = [
    [0x1F300, 0x1FAFF],
    [0x2600, 0x27BF],
    [0xFE00, 0xFE0F],
    [0x1F600, 0x1F64F],
    [0x1F680, 0x1F6FF],
    [0x200D, 0x200D],
  ]
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    // Handle surrogate pairs
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1)
      if (next >= 0xDC00 && next <= 0xDFFF) {
        const full = (code - 0xD800) * 0x400 + (next - 0xDC00) + 0x10000
        for (const [start, end] of emojiRanges) {
          if (full >= start && full <= end) return true
        }
      }
    } else if (code >= 0x2600 && code <= 0x27BF) {
      return true
    }
  }
  return false
}

function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text)
}

function cleanSenseTimeOutput(raw: string): string {
  let text = raw

  // Try to find sections that contain the actual copy
  const markers = [
    /^Final Output Generation.*$/m,
    /^\*Draft\*:?\s*\n?/,
    /^\*\*Draft\*\*:?\s*\n?/,
    /^Draft:?\s*\n?/,
    /^Here('s| is) .*:?\n?$/m,
  ]

  for (const marker of markers) {
    const match = text.match(marker)
    if (match && match.index !== undefined) {
      text = text.slice(match.index + match[0].length).trim()
      break
    }
  }

  if (text === raw) {
    // Fallback: find first line with emoji + Chinese text (likely the title)
    const lines = raw.split('\n')
    const emojiLineIdx = lines.findIndex((l) => {
      const trimmed = l.trim()
      return hasEmoji(trimmed) && hasChinese(trimmed) && trimmed.length > 3
    })
    if (emojiLineIdx > 0 && emojiLineIdx < lines.length / 2) {
      text = lines.slice(emojiLineIdx).join('\n').trim()
    }
  }

  // Remove review sections at the end
  const reviewIdx = text.search(/\n\d+\.\s+\*\*Review/)
  if (reviewIdx !== -1) {
    text = text.slice(0, reviewIdx).trim()
  }

  // Filter out thinking-process lines
  text = text
    .split('\n')
    .filter((l) => {
      const t = l.trim()
      if (!t) return true
      if (/^\d+\.\s+\*\*(Analyze|Understand|Determine|Refine|Tone|Platform|Structure|Idea|Check)/.test(t)) return false
      if (/^(Persona|Role|Task|Constraint|Output|Topic|Keywords)/i.test(t) && t.length < 60) return false
      if (/^\*{1,2}\s*(Title|Intro|Body|Outro|Tags|Opening|Closing|Recipe|Drink)/i.test(t)) return false
      return true
    })
    .join('\n')
    .trim()

  // Strip remaining numbered lines and extra whitespace
  text = text.replace(/^\d+\.\s+.*$/gm, '').trim()
  text = text.replace(/\n{3,}/g, '\n\n').trim()

  return text
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
      ? `你是一个专业的文案写手。${toneStr}。\n当前平台：${platformStr}\n直接输出文案，不要输出思考过程。`
      : `You are a professional copywriter. Tone: ${toneStr.replace('语气', '').trim() || 'natural and fluent'}.\nPlatform: ${platformStr}\nOutput ONLY the copy text.`

    const userPrompt = locale === 'zh-CN'
      ? `请为"${platformStr}"平台创作一段文案。关键词/想法：${prompt}`
      : `Write copy for ${platformStr} platform. Keywords/ideas: ${prompt}`

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
        max_tokens: maxTokens || 300,
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

    const text = cleanSenseTimeOutput(rawText)

    return NextResponse.json({ text })
  } catch (e) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}