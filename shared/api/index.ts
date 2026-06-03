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

export { creem } from './creem'
export { createSupabaseClient } from './supabase'
export type { SupabaseEnv } from './supabase'