'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { locales, type Locale } from 'shared'

const localeNames: Record<Locale, string> = {
  'zh-CN': '中文',
  en: 'English',
}

export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function switchLocale(nextLocale: string) {
    startTransition(() => {
      const segments = pathname.split('/')
      if (segments.length > 1 && (segments[1] === locale || locales.includes(segments[1] as Locale))) {
        segments[1] = nextLocale
      }
      router.push(segments.join('/') || '/')
    })
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span>{localeNames[locale as Locale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl shadow-card bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 z-50 overflow-hidden py-1">
          {locales.map((l) => {
            const active = l === locale
            return (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                disabled={isPending || active}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                  active
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 font-medium'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {active && (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className={active ? '' : 'pl-5.5'}>{localeNames[l]}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}