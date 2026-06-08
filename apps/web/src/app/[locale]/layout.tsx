import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { locales } from 'shared'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import UserMenu from '@/components/UserMenu'
import Link from 'next/link'
import '../globals.css'
import zhCN from 'shared/messages/zh-CN.json'
import en from 'shared/messages/en.json'

const messageMap: Record<string, Record<string, unknown>> = {
  'zh-CN': zhCN as Record<string, unknown>,
  'en': en as Record<string, unknown>,
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(locales, locale)) notFound()

  let messages
  try {
    messages = messageMap[locale] ?? messageMap['zh-CN']
  } catch {
    notFound()
  }

  return (
    <html lang={locale}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`
        }} />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <ErrorBoundary locale={locale}>
              {/* Subtle top accent bar */}
              <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300" />

              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header */}
                <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <Link
                    href={`/${locale}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
                      C
                    </div>
                    <span className="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {locale === 'zh-CN' ? '文案宝' : 'CopyCraft'}
                    </span>
                  </Link>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/${locale}/pricing`}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    >
                      {locale === 'zh-CN' ? '定价' : 'Pricing'}
                    </Link>
                    <div className="flex items-center gap-1.5">
                      <UserMenu />
                    </div>
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                </header>

                <main>{children}</main>

                {/* Footer */}
                <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-600">
                  <p>CopyCraft &copy; {new Date().getFullYear()}</p>
                </footer>
              </div>
            </ErrorBoundary>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}