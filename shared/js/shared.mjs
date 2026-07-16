// ─── CopyCraft Shared JS 版本 ───
// 供非 TypeScript 平台使用

import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

export const locales = ['zh-CN', 'en']
export const defaultLocale = 'en'

const zhCN = require(resolve(__dirname, '../messages/zh-CN.json'))
const en = require(resolve(__dirname, '../messages/en.json'))
const messageMap = { 'zh-CN': zhCN, 'en': en }

export function t(locale, path, fallback) {
  const msg = messageMap[locale] || messageMap['zh-CN']
  if (!msg) return fallback ?? path
  const keys = path.split('.')
  let val = msg
  for (const key of keys) {
    if (val && typeof val === 'object' && key in val) {
      val = val[key]
    } else {
      return fallback ?? path
    }
  }
  return typeof val === 'string' ? val : (fallback ?? path)
}