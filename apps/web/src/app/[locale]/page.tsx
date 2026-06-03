'use client'

import { useState, use, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCopyHistory, useDailyLimit } from 'shared'
import { toPng } from 'html-to-image'
import type { Platform, Tone, Length, Version, HistoryRecord } from 'shared'
import { TEMPLATES } from 'shared'

import { useUser } from '@/components/AuthProvider'
import InfoBar from '@/components/InfoBar'
import InputPanel from '@/components/InputPanel'
import OutputPanel from '@/components/OutputPanel'
import HistoryPanel from '@/components/HistoryPanel'

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const router = useRouter()
  const t = useTranslations()
  const outputRef = useRef<HTMLDivElement>(null)
  const { user, loading: authLoading } = useUser()

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
  const [elapsed, setElapsed] = useState(0)

  const { items: history, addItem, clearAll } = useCopyHistory()
  const { remaining, increment, paid: paidLocal } = useDailyLimit(5)

  // Paid status: server-side (from DB) takes precedence over localStorage
  // Use localStorage as fallback only during auth loading, NOT when user is definitively null
  const paid = user ? !!user.paid : authLoading ? paidLocal : false
  const canGenerate = paid || remaining > 0
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
    setElapsed(0)

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
          maxTokens: length === 'short' ? 800 : length === 'medium' ? 1200 : 2000,
          versionCount: 2,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t('common.error'))
      }

      const data = await res.json()
      if (!data.versions || !Array.isArray(data.versions) || data.versions.length === 0) {
        throw new Error(t('common.error'))
      }
      const v = data.versions as Version[]
      setVersions(v)
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
    const v = currentVersion
    if (!v) return
    let text = ''
    if (v.title) text += v.title + '\n\n'
    text += v.body
    if (v.tags && v.tags.length > 0) text += '\n\n' + v.tags.join(' ')
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      // Fallback: select-all + execCommand for SSR / non-secure context
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      } catch { /* clipboard unavailable */ }
    } else {
      await navigator.clipboard.writeText(text)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExportImage() {
    if (typeof document === 'undefined' || !outputRef.current) return
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
    } catch {
      // Export failed silently — user can retry
    } finally {
      setExporting(false)
    }
  }

  async function handleUpgrade() {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })
      if (res.status === 401) {
        // Not logged in — redirect to sign-in
        router.push(`/${locale}/sign-in`)
        return
      }
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (typeof alert !== 'undefined') {
        alert('Failed to create checkout. Please try again.')
      }
    } catch {
      if (typeof alert !== 'undefined') {
        alert('Failed to create checkout. Please try again.')
      }
    }
  }

  function selectTemplate(tmpl: typeof TEMPLATES[0]) {
    setInput(isZh ? tmpl.prompt : tmpl.enPrompt)
    setShowTemplates(false)
  }

  function handleHistorySelect(item: HistoryRecord) {
    if (item.versions && item.versions.length > 0) {
      setVersions(item.versions)
    } else {
      const lines = item.text.split('\n\n---\n\n')
      setVersions(lines.map((l) => ({ title: '', body: l, tags: [] })))
    }
    setInput(item.prompt)
    setPlatform(item.platform as Platform)
    setTone(item.tone as Tone)
    setShowHistory(false)
  }

  function startEdit(vi: number) {
    setEditingVersion(vi)
    setEditText(versions[vi].body)
  }

  function saveEdit(vi: number) {
    setVersions((prev) => {
      const next = prev.map((v, i) => (i === vi ? { ...v, body: editText } : v))
      // Save edited version to history
      addItem({
        prompt: input,
        platform: platform as string,
        tone: tone as string,
        text: editText,
        versions: next,
        locale,
      })
      return next
    })
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
      <InfoBar
        paid={paid}
        remaining={remaining}
        historyCount={history.length}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
        authLoading={authLoading}
      />

      {showHistory ? (
        <HistoryPanel
          items={filteredHistory}
          searchQuery={historySearch}
          onSearchChange={setHistorySearch}
          platformFilter={historyPlatformFilter}
          onPlatformFilterChange={setHistoryPlatformFilter}
          onClearAll={clearAll}
          onSelect={handleHistorySelect}
          isZh={isZh}
        />
      ) : (
        <>
          <InputPanel
            input={input}
            onInputChange={setInput}
            platform={platform}
            onPlatformChange={setPlatform}
            tone={tone}
            onToneChange={setTone}
            length={length}
            onLengthChange={setLength}
            loading={loading}
            paid={paid}
            canGenerate={canGenerate}
            locale={locale}
            onGenerate={() => handleGenerate()}
            onUpgrade={handleUpgrade}
            showTemplates={showTemplates}
            onToggleTemplates={() => setShowTemplates(!showTemplates)}
            onSelectTemplate={(prompt, enPrompt) => selectTemplate({
              label: '',
              enLabel: '',
              prompt,
              enPrompt,
            } as typeof TEMPLATES[0])}
          />

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 flex justify-between items-center">
              <span className="text-sm">{error}</span>
              <button onClick={() => handleGenerate()} className="text-sm underline hover:no-underline ml-2 whitespace-nowrap">{t('common.retry')}</button>
            </div>
          )}

          {/* Loading — animated during generation */}
          {loading && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-[dot-ping_2.5s_ease-in-out_infinite]" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-[dot-ping_2.5s_ease-in-out_infinite] animation-delay-200" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-[dot-ping_2.5s_ease-in-out_infinite] animation-delay-400" />
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {t('home.generating')}
                  {elapsed > 0 && <span className="ml-2 text-slate-400">({Math.round(elapsed / 1000)}s)</span>}
                </span>
              </div>
              {/* Progress bar — fills left to right, one pass */}
              <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full animate-[fill-progress_60s_ease-out_forwards]"
                />
              </div>
            </div>
          )}

          {/* Output */}
          {versions.length > 0 && (
            <OutputPanel
              versions={versions}
              selectedVersion={selectedVersion}
              onSelectVersion={setSelectedVersion}
              currentVersion={currentVersion}
              editingVersion={editingVersion}
              editText={editText}
              onEditTextChange={setEditText}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onStartEdit={startEdit}
              loading={loading}
              locale={locale}
              onCopy={handleCopy}
              onExportImage={handleExportImage}
              onRegenerate={() => handleGenerate()}
              exporting={exporting}
              copied={copied}
              outputRef={outputRef}
            />
          )}
        </>
      )}
    </div>
  )
}