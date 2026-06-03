'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { usePaymentStatus } from 'shared'

export default function SuccessPage() {
  const t = useTranslations('success')
  const locale = useLocale()
  const router = useRouter()
  const { ready, verified } = usePaymentStatus()

  // Show loading while verifying payment status
  if (!ready) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="animate-spin text-4xl mb-6">⏳</div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('verifying') || 'Verifying payment...'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">{verified ? '🎉' : '⚠️'}</div>
        <h1 className={`text-3xl font-bold mb-4 ${verified ? 'text-green-600' : 'text-amber-600'}`}>
          {verified ? t('title') : t('unverifiedTitle') || 'Payment verification in progress'}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {verified ? t('description') : t('unverifiedDescription') || 'Your payment has been received. Your Pro access will be activated shortly.'}
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