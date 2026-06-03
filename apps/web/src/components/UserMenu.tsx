'use client'

import { useUser } from '@/components/AuthProvider'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const { user, loading, signOut } = useUser()
  const locale = useLocale()
  const router = useRouter()

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse ring-1 ring-slate-100 dark:ring-slate-600" />
    )
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push(`/${locale}/sign-in`)}
        className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
      >
        {locale === 'zh-CN' ? '登录' : 'Sign In'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name ?? user.email}
          className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-700"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-700">
          {(user.name ?? user.email).charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-xs text-slate-600 dark:text-slate-300 hidden sm:inline max-w-[80px] truncate">
        {user.name ?? user.email}
      </span>
      <button
        onClick={async () => {
          await signOut()
          router.refresh()
        }}
        className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-0.5 p-0.5"
        title={locale === 'zh-CN' ? '退出' : 'Sign Out'}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  )
}