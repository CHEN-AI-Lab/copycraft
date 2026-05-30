import { NextRequest, NextResponse } from 'next/server'

const platformNames: Record<string, string> = {
  general: 'general social media',
  wechat: 'WeChat Moments (朋友圈)',
  xiaohongshu: 'Xiaohongshu (小红书)',
  weibo: 'Weibo (微博)',
  zhihu: 'Zhihu (知乎)',
  douyin: 'Douyin (抖音)',
}

const toneLabels: Record<string, string> = {
  normal: '',
  humorous: '语气幽默风趣，可以用网络梗和轻松的表达。',
  emotional: '语气煽情感人，能打动人心。',
  concise: '简洁有力，一句话说清楚核心。',
  formal: '语气正式专业，适合商务场合。',
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
    const toneStr = toneLabels[tone as string] || ''

    const systemPrompt = locale === 'zh-CN'
      ? `你是一个专业的文案写手。${toneStr}直接输出文案，不要输出任何思考过程、分析或注释。只输出文案本身。\n当前平台：${platformStr}`
      : `You are a professional copywriter. ${toneStr.replace(/[。，、]/g, '. ')}Output ONLY the copy text. No thinking process, analysis, or notes.\nPlatform: ${platformStr}`

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
        max_tokens: maxTokens || 1000,
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

    // Extract copy: most SenseTime output puts thinking first, then actual copy
    // Strategy: find first line starting with emoji + Chinese (the social media title)
    const lines = rawText.split('\n')
    let copyStartIdx = -1
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()
      // Skip thinking process lines (start with * or digit)
      if (/^[*\d]/.test(trimmed)) continue
      if (/^[🍋🍃🧊🥤🍹🌿✨🧡🌟💡🎉📸🏔️🥾💖💕🫠🌞❄️💧🍯💡]/.test(trimmed) && /[\u4e00-\u9fff]/.test(trimmed)) {
        copyStartIdx = i
        break
      }
    }

    // Also look for "#" hashtag lines as fallback
    let hashStartIdx = -1
    if (copyStartIdx === -1) {
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim()
        if (/^[*\d]/.test(trimmed)) continue
        if (/^#/.test(trimmed) && /[\u4e00-\u9fff]/.test(trimmed)) {
          hashStartIdx = i
          break
        }
      }
    }

    const startLine = copyStartIdx !== -1 ? copyStartIdx : hashStartIdx
    const text = startLine !== -1
      ? lines.slice(startLine).join('\n').trim()
      : rawText.replace(/^Thinking Process:?\s*/im, '').trim()

    return NextResponse.json({ text })
  } catch (e) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}