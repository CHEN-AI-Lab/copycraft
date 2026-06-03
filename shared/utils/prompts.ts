/**
 * System prompt builders — pure functions that generate AI prompts.
 * Extracted from API route so it's testable and reusable across platforms.
 */

import { PLATFORM_NAMES, TONE_LABELS, LENGTH_LABELS, MAX_TOKENS_SHORT, MAX_TOKENS_MEDIUM, MAX_TOKENS_LONG, MAX_VERSION_COUNT } from '../constants'

export function getMaxTokens(length: string): number {
  if (length === 'short') return MAX_TOKENS_SHORT
  if (length === 'medium') return MAX_TOKENS_MEDIUM
  return MAX_TOKENS_LONG
}

export function getVersionCount(requested: number): number {
  return Math.min(Math.max(requested, 1), MAX_VERSION_COUNT)
}

export function buildSystemPrompt(params: {
  locale: string
  platform: string
  tone: string
  length: string
  versionCount: number
}): string {
  const { locale, platform, tone, length, versionCount } = params
  const platformStr = PLATFORM_NAMES[platform] || 'social media'
  const tonePair = TONE_LABELS[tone] || ['', '']
  const toneStr = locale === 'zh-CN' ? tonePair[0] : tonePair[1]
  const lenPair = LENGTH_LABELS[length] || ['', '']
  const lenStr = locale === 'zh-CN' ? lenPair[0] : lenPair[1]
  const isShort = length === 'short'

  const lineBreakRule = isShort
    ? ''
    : (locale === 'zh-CN'
        ? '适当分行，每行1-2句，不要写成长段落\n'
        : 'Break text into short lines, 1-2 sentences per line\n')

  const baseRules = isShort
    ? `Write ONLY ONE sentence. No line breaks.`
    : (locale === 'zh-CN'
        ? `${lenStr}\n${lineBreakRule}写人话，像朋友聊天，不用书面语\n自然分段，不用"首先其次最后"这类词\n适当用 emoji，不要堆砌`
        : `${lenStr}\n${lineBreakRule}Write naturally like a friend texting\nNo bullet points or lists — flowing paragraphs\nUse emojis naturally, don't overdo it`)

  // JSON-only instruction
  const jsonInst = locale === 'zh-CN'
    ? '返回JSON：{"versions":[{"title":"...","body":"...","tags":["#..."]}]}\n只输出JSON，不要任何思考过程'
    : 'Respond with JSON: {"versions":[{"title":"...","body":"...","tags":["#..."]}]}\nOutput ONLY valid JSON. No thinking process.'

  if (locale === 'zh-CN') {
    return `你是朋友，帮写${versionCount}个版本的${platformStr}文案。${toneStr}

要求：
${baseRules}

${jsonInst}`
  }

  return `You're a friend writing ${versionCount} versions of ${platformStr} copy. ${toneStr}

Rules:
${baseRules}

${jsonInst}`
}

export function buildUserPrompt(locale: string, prompt: string): string {
  return locale === 'zh-CN'
    ? `关键词/想法：${prompt}`
    : `Keywords/ideas: ${prompt}`
}