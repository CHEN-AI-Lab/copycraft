'use client'

import { useState, use } from 'react'
import { useTranslations } from 'next-intl'

const platforms = ['general', 'wechat', 'xiaohongshu', 'weibo', 'zhihu', 'douyin'] as const

type Platform = (typeof platforms)[number]

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations()
  const [input, setInput] = useState('')
  const [platform, setPlatform] = useState<Platform>('general')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, platform, locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setOutput(data.text)
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t('home.title')}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t('home.subtitle')}</p>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6 space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('common.placeholder')}
          rows={4}
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        />

        {/* Platform select */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400 self-center mr-1">
            {t('common.selectPlatform')}:
          </span>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                platform === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t(`platforms.${p}`)}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t('common.loading') : t('common.generate')}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={handleGenerate} className="text-sm underline hover:no-underline">{t('common.retry')}</button>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white">{t('common.result')}</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {copied ? t('common.copied') : t('common.copy')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.regenerate')}
              </button>
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {output}
          </div>
        </div>
      )}
    </div>
  )
}