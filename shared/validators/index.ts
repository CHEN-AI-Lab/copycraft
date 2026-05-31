// Shared validators using zod (works on both frontend and backend)
// DO NOT import any platform-specific APIs here

import { z } from 'zod'

export const platformSchema = z.enum(['general', 'wechat', 'xiaohongshu', 'weibo', 'zhihu', 'douyin'])
export const toneSchema = z.enum(['normal', 'humorous', 'emotional', 'concise', 'formal'])
export const lengthSchema = z.enum(['short', 'medium', 'long'])
export const localeSchema = z.enum(['zh-CN', 'en'])

export const generationRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
  platform: platformSchema.default('general'),
  locale: localeSchema.default('zh-CN'),
  tone: toneSchema.default('normal'),
  length: lengthSchema.default('medium'),
  maxTokens: z.number().min(100).max(4000).default(1200),
  versionCount: z.number().min(1).max(3).default(3),
})

export type GenerationRequestInput = z.infer<typeof generationRequestSchema>