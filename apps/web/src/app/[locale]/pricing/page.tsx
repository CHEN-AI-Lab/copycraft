'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useUser } from '@/components/AuthProvider'

export default function PricingPage() {
  const t = useTranslations('pricing')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const [yearly, setYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    if (authLoading) return
    if (!user) {
      // Not logged in — redirect to sign up with return URL
      router.push(`/${locale}/sign-in?redirect=/${locale}/pricing`)
      return
    }
    // Already paid — go home
    if (user.paid) {
      router.push(`/${locale}`)
      return
    }

    setLoadingPlan('pro')
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, interval: yearly ? 'yearly' : 'monthly' }),
      })
      if (res.status === 401) {
        router.push(`/${locale}/sign-in?redirect=/${locale}/pricing`)
        return
      }
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError(data.error || 'Failed to create checkout')
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoadingPlan(null)
    }
  }

  const plans = [
    {
      id: 'free',
      name: t('free'),
      desc: t('freeDesc'),
      price: 0,
      features: [
        t('freeGens'),
        t('platforms'),
        t('tones'),
        t('history'),
      ],
      cta: t('getStarted'),
      href: `/${locale}`,
      popular: false,
    },
    {
      id: 'pro',
      name: tCommon('pro'),
      desc: t('proDesc'),
      price: yearly ? 99 : 9,
      period: yearly ? '/year' : '/month',
      features: [
        t('proGens'),
        t('platforms'),
        t('tones'),
        t('lengths'),
        t('history'),
        t('exportImage'),
        t('prioritySupport'),
      ],
      cta: user?.paid ? `${tCommon('proActive')} →` : t('subscribe'),
      href: user?.paid ? `/${locale}` : undefined,
      popular: true,
      action: user?.paid ? undefined : handleSubscribe,
    },
  ]

  const savingsPercent = Math.round((1 - 99 / (9 * 12)) * 100)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">
          {t('title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          {t('subtitle')}
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-medium ${!yearly ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
          {t('monthly')}
        </span>
        <button
          onClick={() => setYearly(!yearly)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            yearly ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              yearly ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${yearly ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
          {t('yearly')}
          {yearly && (
            <span className="ml-1 text-xs text-green-500 font-semibold">
              {t('savings', { percent: savingsPercent })}
            </span>
          )}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-md mx-auto mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-6 transition-all ${
              plan.popular
                ? 'border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-800 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {t('mostPopular')}
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {plan.desc}
              </p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-800 dark:text-white">
                  {plan.price === 0 ? '¥0' : plan.id === 'pro' ? (yearly ? '¥720' : '¥69') : ''}
                </span>
                {plan.period && (
                  <span className="text-sm text-slate-400 dark:text-slate-500 ml-1">
                    {plan.period === '/year' ? `/年` : `/月`}
                  </span>
                )}
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <svg className="w-4 h-4 mt-0.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

            {/* CTA */}
            {plan.action ? (
              <button
                onClick={plan.action}
                disabled={loadingPlan === plan.id}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.popular
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {locale === 'zh-CN' ? '处理中...' : 'Processing...'}
                  </span>
                ) : (
                  plan.cta
                )}
              </button>
            ) : (
              <Link
                href={plan.href || '#'}
                className={`block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all ${
                  plan.popular
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-8">
          {t('faq')}
        </h2>
        <div className="space-y-4">
          {[
            { q: t('faqWhat'), a: t('faqWhatAns') },
            { q: t('faqCancel'), a: t('faqCancelAns') },
            { q: t('faqPayment'), a: t('faqPaymentAns') },
          ].map((faq, i) => (
            <details
              key={i}
              className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750">
                {faq.q}
                <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
