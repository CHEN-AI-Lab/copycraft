'use client'

import { useState, use, useRef } from 'react'
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

function getLengthTokens(length: Length): number {
  switch (length) {
    case 'short': return 100
    case 'medium': return 300
    case 'long': return 800
  }
}

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations()
  const outputRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  const [platform, setPlatform] = useState<Platform>('general')
  const [tone, setTone] = useState<Tone>('normal')
  const [length, setLength] = useState<Length>('medium')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [exporting, setExporting] = useState(false)

  const { items: history, addItem, clearAll } = useCopyHistory()
  const { remaining, canGenerate, increment } = useDailyLimit(5)

  async function handleGenerate() {
    if (!input.trim() || !canGenerate) return

    setLoading(true)
    setError('')
    setOutput('')

    try {
      const tokens = getLengthTokens(length)

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          platform,
          locale,
          tone: tone as string,
          maxTokens: tokens,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('common.error'))
      if (!data.text) throw new Error(t('common.error'))

      setOutput(data.text)
      addItem({
        prompt: input,
        platform: platform as string,
        tone: tone as string,
        text: data.text,
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
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExportImage() {
    if (!outputRef.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(outputRef.current, {
        backgroundColor: '#ffffff',
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t('home.title')}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t('home.subtitle')}</p>
      </div>

      {/* Daily limit bar */}
      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2 text-sm">
        <span className="text-blue-700 dark:text-blue-300">
          {t('common.dailyLimit')}: {remaining}/{5} {t('common.times')}
        </span>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
        >
          {showHistory ? '✕ ' + t('common.result') : t('common.history') + ` (${history.length})`}
        </button>
      </div>

      {showHistory ? (
        /* History panel */
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-4 space-y-3 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white">{t('common.history')}</h3>
            {history.length > 0 && (
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700">
                {t('common.clearHistory')}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-slate-400 dark:text-slate-500 text-sm">{t('common.noHistory')}</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                onClick={() => {
                  setOutput(item.text)
                  setInput(item.prompt)
                  setPlatform(item.platform as Platform)
                  setTone(item.tone as Tone)
                  setShowHistory(false)
                }}
              >
                <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 flex gap-2">
                  <span>{t(`platforms.${item.platform}`)}</span>
                  <span>·</span>
                  <span>{item.tone ? t(`tone.${item.tone}`) : '-'}</span>
                  <span className="ml-auto">
                    {new Date(item.createdAt).toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
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
          {/* Input area */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-5 space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('common.placeholder')}
              rows={3}
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />

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

            {/* Tone + Length side by side */}
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
              onClick={handleGenerate}
              disabled={loading || !input.trim() || !canGenerate}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? t('common.loading')
                : !canGenerate
                  ? `${t('common.dailyLimit')} ${t('common.upgrade')}`
                  : t('common.generate')}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 flex justify-between items-center">
              <span className="text-sm">{error}</span>
              <button onClick={handleGenerate} className="text-sm underline hover:no-underline ml-2 whitespace-nowrap">{t('common.retry')}</button>
            </div>
          )}

          {/* Output */}
          {output && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden">
              <div className="p-5" ref={outputRef}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-800 dark:text-white">{t('common.result')}</h3>
                  <div className="text-xs text-slate-400">
                    {t(`platforms.${platform}`)} · {t(`tone.${tone}`)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {output}
                </div>
              </div>
              <div className="flex gap-2 p-3 border-t bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {copied ? t('common.copied') : t('common.copy')}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  {t('common.regenerate')}
                </button>
                <button
                  onClick={handleExportImage}
                  disabled={exporting}
                  className="flex-1 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {exporting ? '...' : t('common.saveImage')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}