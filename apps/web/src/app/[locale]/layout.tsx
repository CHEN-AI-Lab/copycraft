import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { locales } from '../../../next-intl.config'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import '../globals.css'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(locales, locale)) notFound()

  let messages
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default
  } catch {
    notFound()
  }

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                {locale === 'zh-CN' ? '文案宝' : 'CopyCraft'}
              </h1>
              <LanguageSwitcher locale={locale} />
            </div>
            <main>{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}