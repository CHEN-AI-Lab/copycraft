// Locale definitions — cross-platform shared data
// All platforms (Web, MiniProgram, App, Desktop) use the same locales

export const locales = ['zh-CN', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'