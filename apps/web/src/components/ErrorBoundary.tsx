'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  locale?: string
}

interface State {
  hasError: boolean
  error?: Error
}

const errorMessages: Record<string, { title: string; action: string }> = {
  'zh-CN': { title: '出错了', action: '重试' },
  en: { title: 'Something went wrong', action: 'Try Again' },
}

/**
 * Global error boundary — catches unhandled React errors and shows a
 * graceful fallback instead of a white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      const locale = this.props.locale || 'zh-CN'
      const msgs = errorMessages[locale] || errorMessages['zh-CN']

      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          <div className="text-5xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {msgs.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md">
            {this.state.error?.message || msgs.title}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {msgs.action}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
