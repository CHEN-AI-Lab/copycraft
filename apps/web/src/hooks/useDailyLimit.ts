'use client'

import { useState, useEffect, useCallback } from 'react'

const LIMIT_KEY = 'copycraft_daily_usage'
const PAID_KEY = 'copycraft_paid'

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function useDailyLimit(maxFree: number = 5) {
  const [used, setUsed] = useState(0)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    try {
      // Check if user has paid
      const paidRaw = localStorage.getItem(PAID_KEY)
      if (paidRaw === 'true') {
        setPaid(true)
        return // no limit for paid users
      }

      // Free tier: daily limit
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
    if (paid) return // no limit for paid users
    setUsed((prev) => {
      const next = prev + 1
      localStorage.setItem(LIMIT_KEY, JSON.stringify({ date: getTodayKey(), count: next }))
      return next
    })
  }, [paid])

  return { used, remaining, canGenerate, increment, paid }
}