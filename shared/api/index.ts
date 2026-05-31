// API client — shared across all platforms
// DO NOT import any platform-specific APIs here

import type { GenerationRequest, GenerationResponse } from '../types'

export async function generateCopy(req: GenerationRequest): Promise<GenerationResponse> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    return { versions: [], error: err.error || 'Request failed' }
  }
  const data = await res.json()
  return data as GenerationResponse
}

export function getDailyUsed(): number {
  try {
    const raw = localStorage.getItem('copycraft_daily')
    const today = new Date().toDateString()
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    return date === today ? count : 0
  } catch {
    return 0
  }
}

export function incrementDailyUsed(): number {
  const today = new Date().toDateString()
  const current = getDailyUsed()
  const next = current + 1
  localStorage.setItem('copycraft_daily', JSON.stringify({ date: today, count: next }))
  return next
}

export { creem } from './creem'