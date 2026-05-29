import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { locales, defaultLocale } from '../../next-intl.config'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(locales, requested) ? requested : defaultLocale
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    onError(err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Missing translation:', err.message)
      }
    },
    getMessageFallback({ key }) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Missing translation: ${key}`)
        return key
      }
      return key
    }
  }
})