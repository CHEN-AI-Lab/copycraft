// Shared constants used across all platforms
// DO NOT import any platform-specific APIs here

import type { PlatformInfo, ToneInfo, LengthInfo } from '../types'

export const PLATFORMS: PlatformInfo[] = [
  { key: 'general', labelZh: '通用', labelEn: 'General' },
  { key: 'wechat', labelZh: '朋友圈', labelEn: 'WeChat Moments' },
  { key: 'xiaohongshu', labelZh: '小红书', labelEn: 'Xiaohongshu' },
  { key: 'weibo', labelZh: '微博', labelEn: 'Weibo' },
  { key: 'zhihu', labelZh: '知乎', labelEn: 'Zhihu' },
  { key: 'douyin', labelZh: '抖音', labelEn: 'Douyin' },
]

export const TONES: ToneInfo[] = [
  { key: 'normal', labelZh: '普通', labelEn: 'Normal' },
  { key: 'humorous', labelZh: '幽默', labelEn: 'Humorous' },
  { key: 'emotional', labelZh: '煽情', labelEn: 'Emotional' },
  { key: 'concise', labelZh: '简洁', labelEn: 'Concise' },
  { key: 'formal', labelZh: '正式', labelEn: 'Formal' },
]

export const LENGTHS: LengthInfo[] = [
  { key: 'short', labelZh: '短（一句话）', labelEn: 'Short (1 sentence)' },
  { key: 'medium', labelZh: '中等（3-5句）', labelEn: 'Medium (3-5 sentences)' },
  { key: 'long', labelZh: '长文（段落）', labelEn: 'Long (paragraph)' },
]

export const DAILY_LIMIT_FREE = 5

// Locale data — cross-platform shared
export { locales, type Locale, defaultLocale } from './locales'
export const MAX_TOKENS_SHORT = 600
export const MAX_TOKENS_MEDIUM = 1200
export const MAX_TOKENS_LONG = 3000
export const MAX_VERSION_COUNT = 3

// Platform/tone/length key arrays for UI iteration
export const PLATFORM_KEYS = ['general', 'wechat', 'xiaohongshu', 'weibo', 'zhihu', 'douyin'] as const
export const TONE_KEYS = ['normal', 'humorous', 'emotional', 'concise', 'formal'] as const
export const LENGTH_KEYS = ['short', 'medium', 'long'] as const

// Bilingual template prompts — used across all platforms
export interface TemplateItem {
  label: string
  enLabel: string
  prompt: string
  enPrompt: string
}

export const TEMPLATES: TemplateItem[] = [
  { label: '新品发布', enLabel: 'Product Launch', prompt: '发布一款新产品，吸引用户关注购买', enPrompt: 'Announce a new product launch to attract users' },
  { label: '节日祝福', enLabel: 'Holiday Greeting', prompt: '节日问候祝福，温暖有感染力', enPrompt: 'Write a warm holiday greeting that spreads joy' },
  { label: '旅行打卡', enLabel: 'Travel Check-in', prompt: '分享旅行经历，美景美食体验', enPrompt: 'Share a travel experience with beautiful scenery and food' },
  { label: '美食分享', enLabel: 'Food Sharing', prompt: '推荐一道美食，描述味道和体验', enPrompt: 'Recommend a dish, describe its flavor and dining experience' },
  { label: '职场感悟', enLabel: 'Work Insights', prompt: '分享职场经验或人生感悟', enPrompt: 'Share workplace experience or life insights' },
  { label: '读书笔记', enLabel: 'Book Review', prompt: '推荐一本书，分享读后感受', enPrompt: 'Recommend a book and share your thoughts on it' },
  { label: '活动宣传', enLabel: 'Event Promo', prompt: '宣传活动，吸引参与报名', enPrompt: 'Promote an event to drive sign-ups and attendance' },
  { label: '个人简介', enLabel: 'Bio/About', prompt: '自我介绍或个人品牌文案', enPrompt: 'Write a personal bio or personal brand introduction' },
]

export const PLATFORM_NAMES: Record<string, string> = {
  general: 'general social media',
  wechat: 'WeChat Moments (朋友圈)',
  xiaohongshu: 'Xiaohongshu (小红书)',
  weibo: 'Weibo (微博)',
  zhihu: 'Zhihu (知乎)',
  douyin: 'Douyin (抖音)',
}

export const TONE_LABELS: Record<string, [string, string]> = {
  normal: ['', ''],
  humorous: ['语气幽默风趣，可以用网络梗和轻松的表达。', 'Use a funny, playful tone with internet slang and casual expressions.'],
  emotional: ['语气煽情感人，能打动人心。', 'Use an emotional, touching tone that resonates deeply.'],
  concise: ['简洁有力，一句话说清楚核心。', 'Keep it concise and powerful. Get the point across in one sentence.'],
  formal: ['语气正式专业，适合商务场合。', 'Use a formal, professional tone suitable for business contexts.'],
}

export const LENGTH_LABELS: Record<string, [string, string]> = {
  short: ['严格写一句话（不超过50字），严禁使用换行', 'Strictly ONE sentence only (~50 words max), NO line breaks'],
  medium: ['文案长度要求：3-5句话（100-200字左右）', 'Length: 3-5 sentences (~100-200 words)'],
  long: ['文案长度要求：6句以上的段落（200-500字左右）', 'Length: 6+ sentence paragraph (~200-500 words)'],
}