import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'slate'
  size?: 'sm' | 'md'
}

const badgeVariants: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
  green: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300',
  purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
  amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
  red: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300',
  slate: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
}

const badgeSizes: Record<string, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
}

export function Badge({ children, variant = 'blue', size = 'md', className = '' }: BadgeProps & { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}