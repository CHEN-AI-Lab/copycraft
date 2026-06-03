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
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function verify() {
      try {
        // First, verify paid status with the server
        const res = await fetch('/api/user/paid')
        const data = await res.json()
        const isPaid = data.paid === true

        if (cancelled) return

        // Only write to localStorage if server confirms payment
        if (isPaid) {
          try {
            localStorage.setItem(PAID_KEY, 'true')
          } catch { /* localStorage unavailable */ }
          setVerified(true)
        }
      } catch {
        // Server unreachable — don't grant access
      }
      if (!cancelled) setReady(true)
    }

    verify()

    return () => { cancelled = true }
  }, [])

  return { ready, verified }
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
const MAX_DAYS = 7

function keepRecent(items: HistoryRecord[]): HistoryRecord[] {
  const cutoff = Date.now() - MAX_DAYS * 24 * 60 * 60 * 1000
  return items.filter((item) => new Date(item.createdAt).getTime() > cutoff)
}

export function useCopyHistory() {
  const [items, setItems] = useState<HistoryRecord[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const all = JSON.parse(raw) as HistoryRecord[]
        const recent = keepRecent(all)
        // Clean up stale entries from localStorage
        if (recent.length < all.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
        }
        setItems(recent)
      }
    } catch { /* ignore */ }
  }, [])

  const addItem = useCallback((item: Omit<HistoryRecord, 'id' | 'createdAt'>) => {
    const newItem: HistoryRecord = {
      ...item,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    }
    setItems((prev) => {
      const next = [newItem, ...keepRecent(prev)]
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
  // Read payment status synchronously on init to avoid flash of free tier
  const [used, setUsed] = useState(0)
  const [paid, setPaid] = useState(() => {
    try {
      if (typeof localStorage === 'undefined') return false
      return localStorage.getItem(PAID_LIMIT_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      // Always read usage count — don't skip even if paid flag is set
      // (paid status from auth is authoritative; localStorage paid is just a cache)
      const paidRaw = localStorage.getItem(PAID_LIMIT_KEY)
      if (paidRaw === 'true') {
        setPaid(true)
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
    setUsed((prev) => {
      const next = prev + 1
      localStorage.setItem(LIMIT_KEY, JSON.stringify({ date: getTodayKey(), count: next }))
      return next
    })
  }, [])

  return { used, remaining, canGenerate, increment, paid }
}