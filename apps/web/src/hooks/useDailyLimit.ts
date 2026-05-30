'use client'

import { useState, useEffect, useCallback } from 'react'

const LIMIT_KEY = 'copycraft_daily_usage'

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function useDailyLimit(maxFree: number = 5) {
  const [used, setUsed] = useState(0)

  useEffect(() => {
    try {
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

  const increment = useCallback(() => {
    setUsed((prev) => {
      const next = prev + 1
      localStorage.setItem(LIMIT_KEY, JSON.stringify({ date: getTodayKey(), count: next }))
      return next
    })
  }, [])

  return { used, remaining, canGenerate: remaining > 0, increment }
}