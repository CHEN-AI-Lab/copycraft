import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingSizes: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${paddingSizes[padding]} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-b dark:border-slate-700 pb-3 mb-3 ${className}`}>
      {children}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />
  )
}

export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <Card padding="md">
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </Card>
  )
}

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorBanner({ message, onRetry, retryLabel }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 flex justify-between items-center">
      <span className="text-sm">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm underline hover:no-underline ml-2 whitespace-nowrap"
        >
          {retryLabel || 'Retry'}
        </button>
      )}
    </div>
  )
}