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
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

/**
 * Payment status — sets localStorage `copycraft_paid = 'true'` after successful
 * payment. Used by success page across all platforms. Safe to call on any platform:
 * localStorage failure is silently caught.
 */
const PAID_KEY = 'copycraft_paid'

export function usePaymentStatus() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(PAID_KEY, 'true')
    } catch {
      // localStorage unavailable (SSR / mini-program / restricted context)
    }
    setReady(true)
  }, [])

  return { ready }
}

// ─── useCopyHistory ──────────────────────────────────

interface VersionData {
  title: string
  body: string
  tags: string[]
}

interface HistoryRecord {
  id: string
  prompt: string
  platform: string
  tone: string
  text: string
  versions?: VersionData[]
  locale: string
  createdAt: string
}

const STORAGE_KEY = 'copycraft_history'
const MAX_ITEMS = 50

export function useCopyHistory() {
  const [items, setItems] = useState<HistoryRecord[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const addItem = useCallback((item: Omit<HistoryRecord, 'id' | 'createdAt'>) => {
    const newItem: HistoryRecord = {
      ...item,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    }
    setItems((prev) => {
      const next = [newItem, ...prev].slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    return newItem
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { items, addItem, clearAll }
}

// ─── useDailyLimit ───────────────────────────────────

const LIMIT_KEY = 'copycraft_daily_usage'
const PAID_LIMIT_KEY = 'copycraft_paid'

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function useDailyLimit(maxFree: number = 5) {
  const [used, setUsed] = useState(0)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    try {
      const paidRaw = localStorage.getItem(PAID_LIMIT_KEY)
      if (paidRaw === 'true') {
        setPaid(true)
        return
      }
      const raw = localStorage.getItem(LIMIT_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.date === getTodayKey()) {
          setUsed(data.count)
        } else {
          localStorage.setItem(LIMIT_KEY, JSON.stringify({ date: getTodayKey(), count: 0 }))
          setUsed(0)
        }
      } else {
        localStorage.setItem(LIMIT_KEY, JSON.stringify({ date: getTodayKey(), count: 0 }))
      }
    } catch { /* ignore */ }
  }, [])

  const remaining = Math.max(0, maxFree - used)
  const canGenerate = paid || remaining > 0

  const increment = useCallback(() => {
    if (paid) return
    setUsed((prev) => {
      const next = prev + 1
      localStorage.setItem(LIMIT_KEY, JSON.stringify({ date: getTodayKey(), count: next }))
      return next
    })
  }, [paid])

  return { used, remaining, canGenerate, increment, paid }
}