import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform, locale } = await req.json()

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1'
    const model = process.env.OPENAI_MODEL || 'deepseek-chat'

    const platformNames: Record<string, string> = {
      general: 'general social media',
      wechat: 'WeChat Moments (朋友圈)',
      xiaohongshu: 'Xiaohongshu (小红书)',
      weibo: 'Weibo (微博)',
      zhihu: 'Zhihu (知乎)',
      douyin: 'Douyin (抖音)',
    }

    const systemPrompt = locale === 'zh-CN'
      ? `你是一个专业的文案写手。根据用户提供的关键词或想法，生成适合在${platformNames[platform] || '社交媒体'}平台发布的文案。直接输出文案内容，不要输出思考过程。`
      : `You are a professional copywriter. Based on the user's keywords or ideas, generate copy optimized for ${platformNames[platform] || 'social media'}. Output only the copy, no thinking process.`

    const userPrompt = locale === 'zh-CN'
      ? `请为"${platformNames[platform] || '通用'}"平台创作一段文案。关键词/想法：${prompt}`
      : `Write copy for ${platformNames[platform] || 'general'} platform. Keywords/ideas: ${prompt}`

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
        max_tokens: 1000,
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

    // Some APIs put content in 'reasoning' instead of 'content'
    const text = message?.content || message?.reasoning || ''

    return NextResponse.json({ text })
  } catch (e) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}