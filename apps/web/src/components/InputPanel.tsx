'use client'

import { useTranslations } from 'next-intl'
import type { Platform, Tone, Length } from 'shared'
import { PLATFORM_KEYS, TONE_KEYS, LENGTH_KEYS, TEMPLATES, TEMPLATE_CATEGORIES } from 'shared'

interface InputPanelProps {
  input: string
  onInputChange: (v: string) => void
  platform: Platform
  onPlatformChange: (v: Platform) => void
  tone: Tone
  onToneChange: (v: Tone) => void
  length: Length
  onLengthChange: (v: Length) => void
  loading: boolean
  paid: boolean
  canGenerate: boolean
  locale: string
  onGenerate: () => void
  onUpgrade: () => void
  showTemplates: boolean
  onToggleTemplates: () => void
  onSelectTemplate: (prompt: string, enPrompt: string) => void
}

type BtnVariant = 'primary' | 'secondary' | 'ghost'

function PillButton({
  active,
  children,
  onClick,
  variant = 'ghost',
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  variant?: BtnVariant
}) {
  const base = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150'
  if (active) {
    if (variant === 'primary') {
      return (
        <button onClick={onClick} className={`${base} bg-indigo-500 text-white shadow-sm`}>
          {children}
        </button>
      )
    }
    return (
      <button onClick={onClick} className={`${base} bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300`}>
        {children}
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      className={`${base} bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200/60 dark:border-slate-700/40`}
    >
      {children}
    </button>
  )
}

export default function InputPanel({
  input, onInputChange,
  platform, onPlatformChange,
  tone, onToneChange,
  length, onLengthChange,
  loading, paid, canGenerate,
  locale, onGenerate, onUpgrade,
  showTemplates, onToggleTemplates, onSelectTemplate,
}: InputPanelProps) {
  const t = useTranslations()
  const isZh = locale === 'zh-CN'

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-card p-6 space-y-5">
      {/* Header row: title + template selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
          {isZh ? '创作你的文案' : 'Create Your Copy'}
        </h3>
        <button
          onClick={onToggleTemplates}
          className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          {isZh ? '文案模板' : 'Templates'} {showTemplates ? '▲' : '▼'}
        </button>
      </div>

      {/* Template selector dropdown — categorized cards */}
      {showTemplates && (
        <div className="max-h-72 overflow-y-auto -mx-1 px-1 space-y-4">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const catTemplates = TEMPLATES.filter((t) => t.category === cat.key)
            if (catTemplates.length === 0) return null
            return (
              <div key={cat.key}>
                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-0.5">
                  {isZh ? cat.label : cat.enLabel}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {catTemplates.map((tmpl, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectTemplate(tmpl.prompt, tmpl.enPrompt)}
                      className="group text-left bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-2.5 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-150 flex-shrink-0"
                      style={{ maxWidth: '180px' }}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-base leading-none">{tmpl.icon}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors whitespace-nowrap">
                          {isZh ? tmpl.label : tmpl.enLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug line-clamp-1">
                        {isZh ? tmpl.desc : tmpl.enDesc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t('common.placeholder')}
          rows={3}
          className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-sm leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded">
          {input.length} {isZh ? '字' : 'chars'}
        </div>
      </div>

      {/* Platform select */}
      <div>
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2 tracking-wide uppercase">
          {t('common.selectPlatform')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORM_KEYS.map((p) => (
            <PillButton key={p} active={platform === p} onClick={() => onPlatformChange(p)}>
              {t(`platforms.${p}`)}
            </PillButton>
          ))}
        </div>
      </div>

      {/* Tone + Length in grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2 tracking-wide uppercase">
            {t('common.selectTone')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TONE_KEYS.map((tn) => (
              <PillButton key={tn} active={tone === tn} onClick={() => onToneChange(tn)}>
                {t(`tone.${tn}`)}
              </PillButton>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2 tracking-wide uppercase">
            {t('common.selectLength')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LENGTH_KEYS.map((ln) => (
              <PillButton key={ln} active={length === ln} onClick={() => onLengthChange(ln)}>
                {t(`length.${ln}`)}
              </PillButton>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={loading || !input.trim() || (!canGenerate && !paid)}
        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm transition-all duration-150"
      >
        {loading
          ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('common.loading')}
            </span>
          )
          : !canGenerate && !paid
            ? t('common.dailyLimit') + ' ' + t('common.upgrade')
            : t('common.generate')}
      </button>

      {/* Upgrade button */}
      {!canGenerate && !paid && (
        <button
          onClick={onUpgrade}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {t('common.upgrade')}
        </button>
      )}
    </div>
  )
}
