'use client'

import { useState, use, useRef, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useCopyHistory } from '@/hooks/useCopyHistory'
import { useDailyLimit } from '@/hooks/useDailyLimit'
import { toPng } from 'html-to-image'

const platforms = ['general', 'wechat', 'xiaohongshu', 'weibo', 'zhihu', 'douyin'] as const
type Platform = (typeof platforms)[number]

const tones = ['normal', 'humorous', 'emotional', 'concise', 'formal'] as const
type Tone = (typeof tones)[number]

const lengths = ['short', 'medium', 'long'] as const
type Length = (typeof lengths)[number]

interface Version {
  title: string
  body: string
  tags: string[]
}

const TEMPLATES = [
  { label: '新品发布', enLabel: 'Product Launch', prompt: '发布一款新产品，吸引用户关注购买', enPrompt: 'Announce a new product launch to attract users' },
  { label: '节日祝福', enLabel: 'Holiday Greeting', prompt: '节日问候祝福，温暖有感染力', enPrompt: 'Write a warm holiday greeting that spreads joy' },
  { label: '旅行打卡', enLabel: 'Travel Check-in', prompt: '分享旅行经历，美景美食体验', enPrompt: 'Share a travel experience with beautiful scenery and food' },
  { label: '美食分享', enLabel: 'Food Sharing', prompt: '推荐一道美食，描述味道和体验', enPrompt: 'Recommend a dish, describe its flavor and dining experience' },
  { label: '职场感悟', enLabel: 'Work Insights', prompt: '分享职场经验或人生感悟', enPrompt: 'Share workplace experience or life insights' },
  { label: '读书笔记', enLabel: 'Book Review', prompt: '推荐一本书，分享读后感受', enPrompt: 'Recommend a book and share your thoughts on it' },
  { label: '活动宣传', enLabel: 'Event Promo', prompt: '宣传活动，吸引参与报名', enPrompt: 'Promote an event to drive sign-ups and attendance' },
  { label: '个人简介', enLabel: 'Bio/About', prompt: '自我介绍或个人品牌文案', enPrompt: 'Write a personal bio or personal brand introduction' },
]

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations()
  const outputRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  const [platform, setPlatform] = useState<Platform>('general')
  const [tone, setTone] = useState<Tone>('normal')
  const [length, setLength] = useState<Length>('medium')
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedVersion, setSelectedVersion] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [editingVersion, setEditingVersion] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [historyPlatformFilter, setHistoryPlatformFilter] = useState<string>('all')
  const [showTemplates, setShowTemplates] = useState(false)

  const { items: history, addItem, clearAll } = useCopyHistory()
  const { remaining, canGenerate, increment, paid } = useDailyLimit(5)

  const isZh = locale === 'zh-CN'

  // Filtered history
  const filteredHistory = useMemo(() => {
    let list = history
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase()
      list = list.filter((h) => h.prompt.toLowerCase().includes(q) || h.text.toLowerCase().includes(q))
    }
    if (historyPlatformFilter !== 'all') {
      list = list.filter((h) => h.platform === historyPlatformFilter)
    }
    return list
  }, [history, historySearch, historyPlatformFilter])

  async function handleGenerate(templatePrompt?: string) {
    const promptText = templatePrompt || input
    if (!promptText.trim() || !canGenerate) return

    setLoading(true)
    setError('')
    setVersions([])
    setSelectedVersion(0)
    setEditingVersion(null)
    setShowTemplates(false)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          platform,
          locale,
          tone: tone as string,
          length: length as string,
          maxTokens: length === 'short' ? 600 : length === 'medium' ? 1200 : 3000,
          versionCount: 3,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('common.error'))
      if (!data.versions || data.versions.length === 0) throw new Error(t('common.error'))

      const v: Version[] = data.versions
      setVersions(v)

      // Save to history with versions
      addItem({
        prompt: promptText,
        platform: platform as string,
        tone: tone as string,
        text: v.map((ver: Version) => `${ver.title}\n${ver.body}`).join('\n\n---\n\n'),
        versions: v,
        locale,
      })
      increment()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    // Copy full content: title + body + tags
    const v = currentVersion
    if (!v) return
    let text = ''
    if (v.title) text += v.title + '\n\n'
    text += v.body
    if (v.tags && v.tags.length > 0) text += '\n\n' + v.tags.join(' ')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExportImage() {
    if (!outputRef.current) return
    setExporting(true)
    try {
      const isDark = document.documentElement.classList.contains('dark')
      const dataUrl = await toPng(outputRef.current, {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `copycraft-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error('Export image failed:', e)
    } finally {
      setExporting(false)
    }
  }

  async function handleUpgrade() {
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert('Failed to create checkout. Please try again.')
      }
    } catch {
      alert('Failed to create checkout. Please try again.')
    }
  }

  function selectTemplate(tmpl: typeof TEMPLATES[0]) {
    setInput(isZh ? tmpl.prompt : tmpl.enPrompt)
    setShowTemplates(false)
  }

  function startEdit(vi: number) {
    setEditingVersion(vi)
    setEditText(versions[vi].body)
  }

  function saveEdit(vi: number) {
    setVersions((prev) => prev.map((v, i) => (i === vi ? { ...v, body: editText } : v)))
    setEditingVersion(null)
  }

  function cancelEdit() {
    setEditingVersion(null)
  }

  const currentVersion = versions[selectedVersion]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t('home.title')}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t('home.subtitle')}</p>
      </div>

      {/* Daily limit / Pro bar */}
      {paid ? (
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg px-4 py-3 text-sm border border-amber-200 dark:border-amber-700/30">
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              👑 PRO
            </span>
            <span className="text-amber-700 dark:text-amber-300 font-medium">
              {t('common.unlimited')}
            </span>
          </span>
          <button onClick={() => setShowHistory(!showHistory)} className="text-amber-600 dark:text-amber-400 underline hover:no-underline">
              {showHistory ? '✕ ' + t('common.result') : t('common.history') + ` (${history.length})`}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2 text-sm">
          <span className="text-blue-700 dark:text-blue-300">
            {t('common.dailyLimit')}: {remaining}/{5} {t('common.times')}
          </span>
          <button onClick={() => setShowHistory(!showHistory)} className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
              {showHistory ? '✕ ' + t('common.result') : t('common.history') + ` (${history.length})`}
          </button>
        </div>
      )}

      {showHistory ? (
        /* ── History Panel ── */
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-4 space-y-3 max-h-[32rem] overflow-y-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800 dark:text-white mr-auto">{t('common.history')}</h3>
            {history.length > 0 && (
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700">{t('common.clearHistory')}</button>
            )}
          </div>
          {/* Search + filter */}
          <div className="flex gap-2 flex-wrap">
            <input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder={isZh ? '搜索历史...' : 'Search history...'}
              className="flex-1 min-w-[120px] px-3 py-1.5 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={historyPlatformFilter}
              onChange={(e) => setHistoryPlatformFilter(e.target.value)}
              className="px-2 py-1.5 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{isZh ? '全部平台' : 'All'}</option>
              {platforms.map((p) => (
                <option key={p} value={p}>{t(`platforms.${p}`)}</option>
              ))}
            </select>
          </div>
          {filteredHistory.length === 0 ? (
            <p className="text-slate-400 dark:text-slate-500 text-sm">{t('common.noHistory')}</p>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                onClick={() => {
                  // Restore versions from history
                  if (item.versions && item.versions.length > 0) {
                    setVersions(item.versions)
                  } else {
                    // Fallback for old history items
                    const lines = item.text.split('\n\n---\n\n')
                    setVersions(lines.map((l) => ({ title: '', body: l, tags: [] })))
                  }
                  setInput(item.prompt)
                  setPlatform(item.platform as Platform)
                  setTone(item.tone as Tone)
                  setShowHistory(false)
                }}
              >
                <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 flex gap-2 flex-wrap">
                  <span>{t(`platforms.${item.platform}`)}</span>
                  <span>·</span>
                  <span>{item.tone ? t(`tone.${item.tone}`) : '-'}</span>
                  <span className="ml-auto">
                    {new Date(item.createdAt).toLocaleString(isZh ? 'zh-CN' : 'en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{item.text}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {/* ── Input Area ── */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-5 space-y-3">
            {/* Template selector */}
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1"
              >
                📋 {isZh ? '文案模板' : 'Templates'} {showTemplates ? '▲' : '▼'}
              </button>
              {showTemplates && (
                <div className="absolute top-6 left-0 z-10 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg shadow-lg p-2 flex flex-wrap gap-1.5 min-w-[280px]">
                  {TEMPLATES.map((tmpl, i) => (
                    <button
                      key={i}
                      onClick={() => selectTemplate(tmpl)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                    >
                      {isZh ? tmpl.label : tmpl.enLabel}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('common.placeholder')}
              rows={3}
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
            {/* Character count */}
            <div className="text-xs text-slate-400 dark:text-slate-500 text-right">
              {input.length} {isZh ? '字' : 'chars'}
            </div>

            {/* Platform select */}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1.5">{t('common.selectPlatform')}</label>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      platform === p
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {t(`platforms.${p}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone + Length */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1.5">{t('common.selectTone')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {tones.map((tn) => (
                    <button
                      key={tn}
                      onClick={() => setTone(tn)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                        tone === tn
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {t(`tone.${tn}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1.5">{t('common.selectLength')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {lengths.map((ln) => (
                    <button
                      key={ln}
                      onClick={() => setLength(ln)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                        length === ln
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {t(`length.${ln}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={loading || !input.trim() || (!canGenerate && !paid)}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? t('common.loading')
                : !canGenerate && !paid
                  ? t('common.dailyLimit') + ' ' + t('common.upgrade')
                  : t('common.generate')}
            </button>
            {!canGenerate && !paid && (
              <button
                onClick={handleUpgrade}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
              >
                ⭐ {t('common.upgrade')}
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 flex justify-between items-center">
              <span className="text-sm">{error}</span>
              <button onClick={() => handleGenerate()} className="text-sm underline hover:no-underline ml-2 whitespace-nowrap">{t('common.retry')}</button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden animate-pulse">
              <div className="flex border-b dark:border-slate-700">
                {[0,1,2].map(i => (
                  <div key={i} className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 m-0.5 rounded" />
                ))}
              </div>
              <div className="p-5 space-y-3">
                <div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex gap-1.5 mt-3">
                  {[0,1,2].map(i => (
                    <div key={i} className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 p-3 border-t bg-slate-50 dark:bg-slate-800/50">
                {[0,1,2,3].map(i => (
                  <div key={i} className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {/* ── Output (Multi-version) ── */}
          {versions.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden">
              {/* Version tabs */}
              {versions.length > 1 && (
                <div className="flex border-b dark:border-slate-700">
                  {versions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedVersion(i); setEditingVersion(null) }}
                      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                        selectedVersion === i
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {isZh ? `版本 ${i + 1}` : `Version ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-5" ref={outputRef}>
                {/* Title */}
                {currentVersion.title && (
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">{currentVersion.title}</h3>
                )}

                {/* Body (editable) */}
                {editingVersion === selectedVersion ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={6}
                      className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm leading-relaxed"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(selectedVersion)} className="px-4 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                        {isZh ? '保存' : 'Save'}
                      </button>
                      <button onClick={cancelEdit} className="px-4 py-1.5 text-sm rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500">
                        {isZh ? '取消' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {currentVersion.body}
                  </div>
                )}

                {/* Tags */}
                {currentVersion.tags && currentVersion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {currentVersion.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 p-3 border-t bg-slate-50 dark:bg-slate-800/50">
                <button onClick={handleCopy} className="flex-1 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {copied ? '✅ ' + t('common.copied') : '📋 ' + t('common.copy')}
                </button>
                <button onClick={() => startEdit(selectedVersion)} className="flex-1 py-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
                  ✏️ {isZh ? '编辑' : 'Edit'}
                </button>
                <button onClick={() => handleGenerate()} disabled={loading} className="flex-1 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
                  🔄 {t('common.regenerate')}
                </button>
                <button onClick={handleExportImage} disabled={exporting} className="flex-1 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
                  {exporting ? '⏳...' : '🖼️ ' + t('common.saveImage')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}