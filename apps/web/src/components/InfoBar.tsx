'use client'

import { useTranslations } from 'next-intl'
import { DAILY_LIMIT_FREE } from 'shared'

interface InfoBarProps {
  paid: boolean
  remaining: number
  historyCount: number
  showHistory: boolean
  onToggleHistory: () => void
  authLoading?: boolean
}

export default function InfoBar({ paid, remaining, historyCount, showHistory, onToggleHistory, authLoading }: InfoBarProps) {
  const t = useTranslations()

  // Show neutral skeleton while auth is loading to avoid flashing free state
  if (authLoading) {
    return (
      <div className="rounded-xl px-5 py-3.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/30 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    )
  }

  if (paid) {
    return (
      <div className="relative overflow-hidden flex items-center justify-between rounded-xl px-5 py-3.5 
        bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-indigo-50/90
        dark:from-indigo-900/25 dark:via-purple-900/15 dark:to-indigo-800/20
        border border-indigo-200/50 dark:border-indigo-700/30
        shadow-sm shadow-indigo-200/30 dark:shadow-indigo-900/20"
      >
        {/* Gloss overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 pointer-events-none" />

        <span className="flex items-center gap-3 relative z-10">
          {/* PRO badge — light indigo, clean and unified with the bar */}
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-800/60 text-indigo-700 dark:text-indigo-200 text-sm font-bold px-3.5 py-1.5 rounded-xl shadow-sm border border-indigo-200/60 dark:border-indigo-700/40">
            👑 PRO
          </span>

          <div className="flex flex-col leading-tight">
            <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
              <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              无限使用
            </span>
          </div>
        </span>

        <button
          onClick={onToggleHistory}
          className="relative z-10 text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors flex items-center gap-1.5 bg-white/50 dark:bg-indigo-900/20 hover:bg-white/80 dark:hover:bg-indigo-800/30 rounded-lg px-3 py-1.5 border border-indigo-200/40 dark:border-indigo-700/30"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {showHistory ? t('common.result') : `${t('common.history')} (${historyCount})`}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-xl px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
      <span className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        <span className="text-slate-600 dark:text-slate-400">
          {t('common.dailyLimit')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{remaining}</span>
          <span className="text-slate-400 dark:text-slate-500">/{DAILY_LIMIT_FREE}</span>
        </span>
      </span>
      <button
        onClick={onToggleHistory}
        className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors flex items-center gap-1"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {showHistory ? t('common.result') : `${t('common.history')} (${historyCount})`}
      </button>
    </div>
  )
}