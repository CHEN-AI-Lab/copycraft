'use client'

import { useState, useEffect, useCallback } from 'react'

export interface VersionData {
  title: string
  body: string
  tags: string[]
}

export type HistoryItem = {
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
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const addItem = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newItem: HistoryItem = {
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