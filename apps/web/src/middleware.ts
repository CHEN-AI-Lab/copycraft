import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '../next-intl.config'

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}