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

    // Use a delimiter marker to extract just the copy text from the response
    const DELIMITER_START = '<<<COPY_START>>>'
    const DELIMITER_END = '<<<COPY_END>>>'

    const systemPrompt = locale === 'zh-CN'
      ? `你是一个专业的文案写手。\n约束：\n1. ${toneStr}\n2. 在文案开头加上 ${DELIMITER_START}，结尾加上 ${DELIMITER_END}\n3. 两个标记之间只放文案正文，不放任何思考过程\n4. 平台：${platformStr}`
      : `You are a professional copywriter.\nRules:\n1. Tone: ${toneStr.replace('语气', '').trim() || 'natural and fluent'}\n2. Start copy with ${DELIMITER_START} and end with ${DELIMITER_END}\n3. No thinking process between the markers\n4. Platform: ${platformStr}`

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

    // Extract text between delimiters
    const startIdx = rawText.indexOf(DELIMITER_START)
    const endIdx = rawText.indexOf(DELIMITER_END)

    let text = ''
    if (startIdx !== -1 && endIdx !== -1) {
      text = rawText.slice(startIdx + DELIMITER_START.length, endIdx).trim()
    } else if (startIdx !== -1) {
      text = rawText.slice(startIdx + DELIMITER_START.length).trim()
    } else if (endIdx !== -1) {
      text = rawText.slice(0, endIdx).trim()
    } else if (message?.content) {
      // If content field is populated directly, use it
      text = message.content
    } else {
      // Fallback: use first half of reasoning (before the actual thinking kicks in, it outputs copy)
      // This rarely works well but is better than nothing
      text = rawText
    }

    // Clean up any remaining thinking artifacts
    text = text
      .replace(/^#{1,6}\s+.*$/gm, '')  // Remove markdown headers
      .replace(/^\*{1,2}.*\*{1,2}$/gm, '')  // Remove bold/italic lines
      .trim()

    return NextResponse.json({ text })
  } catch (e) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}