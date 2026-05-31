// Shared React hooks — works across Web / MiniProgram / App
// Import from 'shared' (barrel export)
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Debounce a value — useful for search input
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/**
 * Previous value ref
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}