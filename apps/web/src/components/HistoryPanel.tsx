'use client'

import { useTranslations } from 'next-intl'
import type { HistoryRecord } from 'shared'
import { PLATFORM_KEYS } from 'shared'

interface HistoryPanelProps {
  items: HistoryRecord[]
  searchQuery: string
  onSearchChange: (v: string) => void
  platformFilter: string
  onPlatformFilterChange: (v: string) => void
  onClearAll: () => void
  onSelect: (item: HistoryRecord) => void
  isZh: boolean
}

export default function HistoryPanel({
  items, searchQuery, onSearchChange, platformFilter, onPlatformFilterChange,
  onClearAll, onSelect, isZh,
}: HistoryPanelProps) {
  const t = useTranslations()

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-card p-5 space-y-4 max-h-[32rem] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {t('common.history')}
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </h3>
        {items.length > 0 && (
          <button onClick={onClearAll} className="text-xs text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors">
            {isZh ? '清空全部' : 'Clear all'}
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isZh ? '搜索历史...' : 'Search history...'}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => onPlatformFilterChange(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
        >
          <option value="all">{isZh ? '全部平台' : 'All'}</option>
          {PLATFORM_KEYS.map((p) => (
            <option key={p} value={p}>{t(`platforms.${p}`)}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <svg className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-sm text-slate-400 dark:text-slate-500">{t('common.noHistory')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all border border-slate-100 dark:border-slate-700/30 hover:shadow-card-hover"
              onClick={() => onSelect(item)}
            >
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 font-medium">
                  {t(`platforms.${item.platform}`)}
                </span>
                {item.tone && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>{t(`tone.${item.tone}`)}</span>
                  </>
                )}
                <span className="ml-auto">
                  {new Date(item.createdAt).toLocaleString(isZh ? 'zh-CN' : 'en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}