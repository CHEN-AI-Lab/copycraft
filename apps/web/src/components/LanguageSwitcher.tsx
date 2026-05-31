'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { locales, type Locale } from 'shared'

const localeNames: Record<Locale, string> = {
  'zh-CN': '中文',
  en: 'English',
}

type Props = {
  locale: string
}

export default function LanguageSwitcher({ locale }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchLocale(nextLocale: string) {
    startTransition(() => {
      const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`)
      router.push(newPath)
    })
  }

  const currentLocale = locale as Locale

  return (
    <div className="flex items-center gap-1 border rounded-lg px-2 py-1 bg-white dark:bg-slate-800">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          disabled={isPending || l === currentLocale}
          className={`px-2 py-0.5 rounded text-sm transition-colors ${
            l === currentLocale
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {localeNames[l]}
        </button>
      ))}
    </div>
  )
}