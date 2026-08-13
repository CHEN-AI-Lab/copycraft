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
export const MAX_TOKENS_SHORT = 800
export const MAX_TOKENS_MEDIUM = 1200
export const MAX_TOKENS_LONG = 2000
export const MAX_VERSION_COUNT = 3

// Platform/tone/length key arrays for UI iteration
export const PLATFORM_KEYS = ['general', 'wechat', 'xiaohongshu', 'weibo', 'zhihu', 'douyin'] as const
export const TONE_KEYS = ['normal', 'humorous', 'emotional', 'concise', 'formal'] as const
export const LENGTH_KEYS = ['short', 'medium', 'long'] as const

// ─── Bilingual template prompts ──────────────────────────
export interface TemplateItem {
  label: string
  enLabel: string
  category: string
  enCategory: string
  icon: string
  desc: string
  enDesc: string
  prompt: string
  enPrompt: string
}

// Category order for display
export const TEMPLATE_CATEGORIES: { key: string; label: string; enLabel: string }[] = [
  { key: 'marketing', label: '营销推广', enLabel: 'Marketing' },
  { key: 'life', label: '生活日常', enLabel: 'Daily Life' },
  { key: 'personal', label: '个人品牌', enLabel: 'Personal Brand' },
]

export const TEMPLATES: TemplateItem[] = [
  // ── Marketing ──
  { label: '新品发布', enLabel: 'Product Launch', category: 'marketing', enCategory: 'Marketing', icon: '🚀', desc: '发布新产品，制造期待感', enDesc: 'Build hype for a new product', prompt: '正式发布一款新产品，强调核心卖点和用户价值，吸引目标用户关注和购买', enPrompt: 'Announce a new product launch, highlight key features and user value to drive interest and sales' },
  { label: '活动促销', enLabel: 'Sales Promo', category: 'marketing', enCategory: 'Marketing', icon: '🏷️', desc: '限时折扣，刺激转化', enDesc: 'Limited-time offer to boost conversions', prompt: '策划一次限时促销活动，突出优惠力度和紧迫感，促使用户立即下单', enPrompt: 'Create a time-limited sales promotion, emphasize the discount and urgency to drive purchases' },
  { label: '品牌故事', enLabel: 'Brand Story', category: 'marketing', enCategory: 'Marketing', icon: '📖', desc: '讲述品牌背后的故事', enDesc: 'Tell your brand story with heart', prompt: '讲述品牌创立的故事或核心价值观，让用户产生情感共鸣和品牌认同', enPrompt: 'Tell your brand origin story or core values to build emotional connection and brand loyalty' },
  { label: '活动宣传', enLabel: 'Event Promo', category: 'marketing', enCategory: 'Marketing', icon: '🎪', desc: '宣传活动，吸引报名', enDesc: 'Drive event sign-ups', prompt: '宣传活动或线下聚会，突出亮点和参与价值，吸引目标人群报名参加', enPrompt: 'Promote an event or meetup, highlight the value proposition to drive attendance and sign-ups' },

  // ── Daily Life ──
  { label: '旅行打卡', enLabel: 'Travel Check-in', category: 'life', enCategory: 'Daily Life', icon: '✈️', desc: '分享旅途美景趣事', enDesc: 'Share travel highlights', prompt: '分享一次旅行经历，描述独特的景色、美食或体验，让读者有身临其境的感觉', enPrompt: 'Share a travel experience with vivid descriptions of scenery, food, and personal moments' },
  { label: '美食推荐', enLabel: 'Food Review', category: 'life', enCategory: 'Daily Life', icon: '🍜', desc: '安利好吃的，色香味俱全', enDesc: 'Tempt with delicious descriptions', prompt: '推荐一道美食或一家餐厅，用生动语言描述口味、环境和体验，让人想去尝试', enPrompt: 'Recommend a dish or restaurant with mouth-watering descriptions of flavor, ambiance, and service' },
  { label: '节日祝福', enLabel: 'Holiday Greeting', category: 'life', enCategory: 'Daily Life', icon: '🎉', desc: '温暖走心的节日问候', enDesc: 'Warm and heartfelt wishes', prompt: '写一段节日祝福文案，温暖真诚有感染力，适合发给朋友或发朋友圈', enPrompt: 'Write a warm, heartfelt holiday greeting suitable for friends or social media posts' },
  { label: '读书笔记', enLabel: 'Book Review', category: 'life', enCategory: 'Daily Life', icon: '📚', desc: '分享好书的感悟', enDesc: 'Share insights from good books', prompt: '推荐一本书并分享读后感受，提炼书中核心观点和自己的收获', enPrompt: 'Recommend a book and share key takeaways, insights, and personal reflections' },

  // ── Personal Brand ──
  { label: '个人简介', enLabel: 'Bio/About', category: 'personal', enCategory: 'Personal Brand', icon: '👤', desc: '打造个人品牌标签', enDesc: 'Craft your personal brand', prompt: '写一段个人简介或品牌介绍文案，突出专业身份、核心能力和独特价值', enPrompt: 'Write a personal bio or brand introduction highlighting expertise, skills, and unique value' },
  { label: '职场感悟', enLabel: 'Work Insights', category: 'personal', enCategory: 'Personal Brand', icon: '💼', desc: '分享职场经验心得', enDesc: 'Share career lessons', prompt: '分享一段职场经验或人生感悟，有干货有温度，能引发职场人共鸣', enPrompt: 'Share career experience or life lessons that are both insightful and relatable to professionals' },
  { label: '求职自我介绍', enLabel: 'Cover Letter', category: 'personal', enCategory: 'Personal Brand', icon: '📝', desc: '面试/简历用的自我介绍', enDesc: 'Stand out in interviews', prompt: '写一段求职或面试用的自我介绍，突出个人优势和岗位匹配度，简洁有力', enPrompt: 'Write a compelling self-introduction for job interviews, highlighting strengths and role fit' },
  { label: '感谢信', enLabel: 'Thank You Note', category: 'personal', enCategory: 'Personal Brand', icon: '💌', desc: '真诚的感谢与致意', enDesc: 'Sincere gratitude in words', prompt: '写一段真诚的感谢文案，表达对客户/同事/合作伙伴的谢意', enPrompt: 'Write a sincere thank-you note expressing gratitude to a client, colleague, or partner' },
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

export const WORKER_URL =
  (typeof process !== 'undefined' &&
    (process as any).env?.NEXT_PUBLIC_WORKER_URL) ||
  'https://stats.aaigc.workers.dev'

// Fallback tracking endpoint for users who cannot reach the Worker (e.g. China)
// Sends tracking data directly to the stats-dashboard API.
// Must be set via NEXT_PUBLIC_FALLBACK_URL env var — no hardcoded default.
export const FALLBACK_URL =
  (typeof process !== 'undefined' &&
    (process as any).env?.NEXT_PUBLIC_FALLBACK_URL) || ''