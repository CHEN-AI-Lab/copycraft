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

interface Version {
  title: string
  body: string
  tags: string[]
}

function parseVersions(raw: string): { title: string; body: string; tags: string[] }[] {
  try {
    // Try direct JSON parse
    const parsed = JSON.parse(raw)
    if (parsed.versions && Array.isArray(parsed.versions)) return parsed.versions
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
  // Fallback: wrap entire output as single version
  return [{ title: '', body: raw.trim(), tags: [] }]
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform, locale, tone, versionCount = 3 } = await req.json()

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

    const count = Math.min(Math.max(versionCount, 1), 3)

    const systemPrompt = locale === 'zh-CN'
      ? `你是一个专业的文案写手。${toneStr}
生成 ${count} 个不同版本的文案，以JSON格式输出。

每个版本包含：
- title: 标题 / 开头一句话（吸引眼球）
- body: 正文文案
- tags: 3-5个相关标签（带 # 号）

JSON格式示例：
{
  "versions": [
    { "title": "...", "body": "...", "tags": ["#tag1", "#tag2"] }
  ]
}

不要输出任何思考过程、分析或注释。只输出JSON。
当前平台：${platformStr}`
      : `You are a professional copywriter. ${toneStr}
Generate ${count} different versions of copy in JSON format.

Each version includes:
- title: Headline / hook (attention-grabbing)
- body: Main copy text
- tags: 3-5 relevant hashtags (with #)

JSON format example:
{
  "versions": [
    { "title": "...", "body": "...", "tags": ["#tag1", "#tag2"] }
  ]
}

Output ONLY valid JSON. No thinking process, analysis, or notes.
Platform: ${platformStr}`

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
        max_tokens: 2000,
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

    return NextResponse.json({ versions })
  } catch (e) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}