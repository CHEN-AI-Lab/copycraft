// Shared types used across all platforms (Web, MiniProgram, App, Desktop)
// DO NOT import any platform-specific APIs here

export interface Version {
  title: string
  body: string
  tags: string[]
}

export interface GenerationRequest {
  prompt: string
  platform: Platform
  locale: 'zh-CN' | 'en'
  tone: Tone
  length: Length
  maxTokens: number
  versionCount: number
}

export interface GenerationResponse {
  versions: Version[]
  error?: string
}

export type Platform = 'general' | 'wechat' | 'xiaohongshu' | 'weibo' | 'zhihu' | 'douyin'

export type Tone = 'normal' | 'humorous' | 'emotional' | 'concise' | 'formal'

export type Length = 'short' | 'medium' | 'long'

export interface HistoryItem {
  id: string
  prompt: string
  versions: Version[]
  timestamp: number
  platform: Platform
  locale: string
  length: Length
  tone: Tone
}

export interface PlatformInfo {
  key: Platform
  labelZh: string
  labelEn: string
}

export interface ToneInfo {
  key: Tone
  labelZh: string
  labelEn: string
}

export interface LengthInfo {
  key: Length
  labelZh: string
  labelEn: string
}