'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

export default function SuccessPage() {
  const t = useTranslations('success')
  const locale = useLocale()
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'done'>('processing')

  useEffect(() => {
    try {
      localStorage.setItem('copycraft_paid', 'true')
      setStatus('done')
    } catch {
      setStatus('done')
    }
  }, [])

  if (status === 'processing') return null

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {t('description')}
        </p>
        <button
          onClick={() => router.push(`/${locale}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          {t('back')}
        </button>
      </div>
    </main>
  )
}