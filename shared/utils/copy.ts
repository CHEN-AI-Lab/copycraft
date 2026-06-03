/**
 * Parse AI-generated version data from raw API response text.
 * Handles direct JSON, code-block-wrapped JSON, and malformed output.
 */
export function parseVersions(raw: string): { title: string; body: string; tags: string[] }[] {
  try {
    // Try direct JSON parse
    const parsed = JSON.parse(raw)
    if (parsed.versions && Array.isArray(parsed.versions)) {
      return parsed.versions
    }
    if (Array.isArray(parsed)) return parsed
  } catch {
    // Try extracting JSON from markdown code block
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      try {
        const parsed = JSON.parse(match[1])
        if (parsed.versions && Array.isArray(parsed.versions)) return parsed.versions
        if (Array.isArray(parsed)) return parsed
      } catch { /* fall through */ }
    }
  }

  // Fallback: try to extract first JSON object containing "versions"
  // Uses non-greedy matching to avoid matching multiple JSON objects
  try {
    const objMatch = raw.match(/\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*"versions"(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/)
    if (objMatch) {
      const parsed = JSON.parse(objMatch[0])
      if (parsed.versions && Array.isArray(parsed.versions)) return parsed.versions
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // Try simpler greedy regex as last resort
    try {
      const greedyMatch = raw.match(/\{[\s\S]*?"versions"[\s\S]*?\}/)
      if (greedyMatch) {
        const parsed = JSON.parse(greedyMatch[0])
        if (parsed.versions && Array.isArray(parsed.versions)) return parsed.versions
      }
    } catch { /* fall through */ }
  }

  // Last resort: try to extract JSON array directly
  try {
    const arrMatch = raw.match(/\[[\s\S]*?\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}\]/)
    if (arrMatch) {
      const parsed = JSON.parse(arrMatch[0])
      if (Array.isArray(parsed)) return parsed
    }
  } catch { /* fall through */ }

  // Give up
  return []
}

/**
 * Format a version for display, applying line-break rules per length.
 */
export function formatVersion(
  v: { title?: string; body?: string; tags?: string[] },
  isShort = false,
): { title: string; body: string; tags: string[] } {
  let body = (v.body || '').trim()
  // For medium/long: ensure line breaks if AI forgot them
  if (!isShort && body && !body.includes('\n')) {
    body = body.replace(/([。！？.!?】])\s*/g, '$1\n').trim()
  }
  return {
    title: v.title || '',
    body,
    tags: (v.tags || []).filter(t => t),
  }
}
