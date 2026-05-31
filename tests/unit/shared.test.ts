import { describe, it, expect } from 'vitest'
import { generateId, truncate, formatBody } from '../../shared/utils'
import { generationRequestSchema } from '../../shared/validators'
import { PLATFORMS, TONES, LENGTHS } from '../../shared/constants'

describe('shared/utils', () => {
  describe('generateId', () => {
    it('generates a unique id', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
    it('includes timestamp', () => {
      const id = generateId()
      expect(id).toMatch(/^\d+-/)
    })
  })

  describe('truncate', () => {
    it('returns text as-is if within max length', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })
    it('truncates and adds ellipsis if over max length', () => {
      expect(truncate('hello world', 5)).toBe('hello...')
    })
    it('returns empty string for falsy input', () => {
      expect(truncate('', 5)).toBe('')
    })
  })

  describe('formatBody', () => {
    it('returns empty string for empty input', () => {
      expect(formatBody('')).toBe('')
    })

    it('preserves existing line breaks', () => {
      const withBreaks = 'line one\nline two\nline three'
      expect(formatBody(withBreaks)).toBe(withBreaks)
    })

    it('adds line breaks after Chinese period in single-line content', () => {
      const oneLine = '句子一。句子二。句子三'
      const result = formatBody(oneLine)
      expect(result).toContain('句子一。')
      expect(result).toContain('句子二。')
      expect(result.split('\n').length).toBeGreaterThanOrEqual(3)
    })
  })
})

describe('shared/validators', () => {
  it('accepts valid generation request', () => {
    const result = generationRequestSchema.safeParse({
      prompt: 'test prompt',
      platform: 'xiaohongshu',
      locale: 'zh-CN',
      tone: 'humorous',
      length: 'short',
      maxTokens: 600,
      versionCount: 2,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing prompt', () => {
    const result = generationRequestSchema.safeParse({
      prompt: '',
    })
    expect(result.success).toBe(false)
  })

  it('applies defaults for optional fields', () => {
    const result = generationRequestSchema.parse({ prompt: 'test' })
    expect(result.platform).toBe('general')
    expect(result.tone).toBe('normal')
    expect(result.length).toBe('medium')
    expect(result.versionCount).toBe(3)
  })
})

describe('shared/constants', () => {
  it('has 6 platforms', () => {
    expect(PLATFORMS).toHaveLength(6)
  })
  it('has 5 tones', () => {
    expect(TONES).toHaveLength(5)
  })
  it('has 3 lengths', () => {
    expect(LENGTHS).toHaveLength(3)
  })
})
