import { NextRequest, NextResponse } from 'next/server'

const platformNames: Record<string, string> = {
  general: 'general social media',
  wechat: 'WeChat Moments (朋友圈)',
  xiaohongshu: 'Xiaohongshu (小红书)',
  weibo: 'Weibo (微博)',
  zhihu: 'Zhihu (知乎)',
  douyin: 'Douyin (抖音)',
}

const toneLabels: Record<string, [string, string]> = {
  normal: ['', ''],
  humorous: ['语气幽默风趣，可以用网络梗和轻松的表达。', 'Use a funny, playful tone with internet slang and casual expressions.'],
  emotional: ['语气煽情感人，能打动人心。', 'Use an emotional, touching tone that resonates deeply.'],
  concise: ['简洁有力，一句话说清楚核心。', 'Keep it concise and powerful. Get the point across in one sentence.'],
  formal: ['语气正式专业，适合商务场合。', 'Use a formal, professional tone suitable for business contexts.'],
}

const lengthLabels: Record<string, [string, string]> = {
  short: ['严格写一句话（不超过50字），严禁使用换行', 'Strictly ONE sentence only (~50 words max), NO line breaks'],
  medium: ['文案长度要求：3-5句话（100-200字左右）', 'Length: 3-5 sentences (~100-200 words)'],
  long: ['文案长度要求：6句以上的段落（200-500字左右）', 'Length: 6+ sentence paragraph (~200-500 words)'],
}

interface Version {
  title: string
  body: string
  tags: string[]
}

function parseVersions(raw: string): { title: string; body: string; tags: string[] }[] {
  try {
    // Try direct JSON parse
    const parsed = JSON.parse(raw)
    if (parsed.versions && Array.isArray(parsed.versions)) {
      return parsed.versions
    }
    if (Array.isArray(parsed)) return parsed
  } catch {
    // Try extracting JSON from markdown code block
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      try {
        const parsed = JSON.parse(match[1])
        if (parsed.versions && Array.isArray(parsed.versions)) return parsed.versions
        if (Array.isArray(parsed)) return parsed
      } catch { /* fall through */ }
    }
  }
  // Fallback: return error
  return []
}

function formatVersion(v: { title?: string; body?: string; tags?: string[] }, isShort = false): { title: string; body: string; tags: string[] } {
  let body = (v.body || '').trim()
  // For medium/long: ensure line breaks if AI forgot them
  if (!isShort && body && !body.includes('\n')) {
    body = body.replace(/([。！？.!?】])\s*/g, '$1\n').trim()
  }
  return {
    title: v.title || '',
    body,
    tags: (v.tags || []).filter(t => t),
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform, locale, tone, length: len = 'medium', versionCount = 3 } = await req.json()

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1'
    const model = process.env.OPENAI_MODEL || 'deepseek-chat'
    const platformStr = platformNames[platform as string] || 'social media'
    const tonePair = toneLabels[tone as string] || ['', '']
    const toneStr = locale === 'zh-CN' ? tonePair[0] : tonePair[1]
    const lenPair = lengthLabels[len as string] || ['', '']
    const lenStr = locale === 'zh-CN' ? lenPair[0] : lenPair[1]

    const count = Math.min(Math.max(versionCount, 1), 3)
    const isShort = len === 'short'

    const lineBreakRule = isShort
      ? ''
      : (locale === 'zh-CN' ? '- 适当分行，每行 1-2 句，不要写成长段落\n' : '- Break text into short lines (1-2 sentences per line), avoid long paragraphs\n')

    const systemPrompt = locale === 'zh-CN'
      ? `你是一个专业的社交媒体文案写手。${toneStr}

请创作 ${count} 个不同版本的文案，以JSON格式返回。

每个版本包含：
- title: 文案的标题或开头
- body: 正文文案（注意以下要求）
- tags: 3-5个相关标签（带 # 号）

正文写作要求：\n- ${lenStr}\n- 风格自然、有温度，符合社交媒体阅读习惯
    - 适当使用 emoji 表情增强氛围
    ${lineBreakRule}- 读起来轻松，像朋友聊天一样自然
    - 不要堆砌表情，适当点缀即可
    - 根据平台调整风格（朋友圈/小红书偏活泼，知乎偏深度）

JSON格式示例：
{
  "versions": [
    { "title": "...", "body": "...", "tags": ["#tag1", "#tag2"] }
  ]
}

不要输出任何思考过程。只输出JSON。
当前平台：${platformStr}`
      : `You are a professional social media copywriter. ${toneStr}

Create ${count} different versions of copy, returning them in JSON format.

Each version includes:
- title: Headline or opening line
- body: Main copy text (follow requirements below)
- tags: 3-5 relevant hashtags (with # sign)

Body writing requirements:\n- ${lenStr}\n- Natural, warm style suitable for social media reading
    - Use emojis appropriately to enhance the mood
    ${lineBreakRule}- Read like a friendly conversation
    - Don't overuse emojis, just sprinkle them in naturally
    - Adjust style per platform (casual for social, deeper for professional)

JSON format example:
{
  "versions": [
    { "title": "...", "body": "...", "tags": ["#tag1", "#tag2"] }
  ]
}

Output ONLY valid JSON. No thinking process.
Platform: ${platformStr}`

    const userPrompt = locale === 'zh-CN'
      ? `关键词/想法：${prompt}`
      : `Keywords/ideas: ${prompt}`

    let maxTokens = 2000
    try {
      const body = await req.clone().json()
      maxTokens = body.maxTokens || 2000
    } catch { /* use default */ }

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
        max_tokens: maxTokens,
        temperature: 0.8,
        reasoning_effort: "none",
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('AI API error:', response.status, errBody)
      return NextResponse.json({ error: `AI API error: ${response.status}` }, { status: 502 })
    }

    const data = await response.json()
    const message = data.choices?.[0]?.message
    const raw = message?.content || message?.reasoning || ''
    const versions = parseVersions(raw)
    // Re-format with correct length awareness
    const formattedVersions = versions.map(v => formatVersion(v, len === 'short'))

    return NextResponse.json({ versions: formattedVersions })
  } catch (e) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}