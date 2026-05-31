import { NextRequest, NextResponse } from 'next/server'
import type { Version } from 'shared'
import { PLATFORM_NAMES as platformNames, TONE_LABELS as toneLabels, LENGTH_LABELS as lengthLabels, parseVersions, formatVersion } from 'shared'

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
      ? `你是一个擅长聊天的朋友，帮用户写社交媒体文案。${toneStr}

请创作 ${count} 个不同版本的文案，以JSON格式返回。

每个版本包含：
- title: 文案的标题或开头
- body: 正文文案（注意以下要求）
- tags: 3-5个相关标签（带 # 号）

正文写作要求：\n- ${lenStr}\n- 写人话，像朋友在微信聊天一样自然，不用书面语\n- 禁止使用"首先、其次、最后、总的来说、综上所述"这类结构词\n- 禁止写成清单或分点格式，读起来像是一气呵成的话\n- 适当使用 emoji 表情增强氛围，不要堆砌
    ${lineBreakRule}- 读起来要有真实感，像是真实用户在分享生活，不是营销号\n- 根据平台调整风格（朋友圈/小红书偏活泼口语化，知乎偏有料有观点）

JSON格式示例：
{
  "versions": [
    { "title": "...", "body": "...", "tags": ["#tag1", "#tag2"] }
  ]
}

不要输出任何思考过程。只输出JSON。
当前平台：${platformStr}`
      : `You're a good friend helping a friend write social media posts. ${toneStr}

Create ${count} different versions of copy, returning them in JSON format.

Each version includes:
- title: Headline or opening line
- body: Main copy text (follow requirements below)
- tags: 3-5 relevant hashtags (with # sign)

Body writing requirements:\n- ${lenStr}\n- Write like a real person texting a friend — casual, natural, no corporate speak\n- No "firstly, secondly, finally, in conclusion, in summary" — just write naturally
    - Don't use bullet points or numbered lists — write in flowing paragraphs\n- Sprinkle emojis naturally, don't overdo it
    ${lineBreakRule}- Make it sound authentic — like an actual person sharing their life, not an ad campaign\n- Adjust style per platform (casual for social media, more opinionated for Zhihu/Medium)

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