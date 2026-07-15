import { locales, defaultLocale } from 'shared'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales,            // from shared/constants/locales.ts
  defaultLocale,      // from shared/constants/locales.ts
  localePrefix: 'always',
})