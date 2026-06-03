// Shared utilities — pure functions only, no platform APIs
// Each function has unit tests in tests/unit/shared.test.ts

/**
 * Generate a unique ID for history items
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text: string, maxLen: number): string {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Copy-generation utilities (extracted from apps/web API routes)
export { parseVersions, formatVersion } from './copy'
// System prompt builders (pure functions, cross-platform)
export { buildSystemPrompt, buildUserPrompt, getMaxTokens, getVersionCount } from './prompts'
// Auth error translation (maps Supabase errors to i18n keys)
export { translateAuthError } from './auth-errors'