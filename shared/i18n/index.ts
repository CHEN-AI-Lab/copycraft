// ─── CopyCraft 通用翻译加载器 ───
// 跨平台可用（Web / 小程序 / App）

import zhCN from '../messages/zh-CN.json' with { type: 'json' }
import en from '../messages/en.json' with { type: 'json' }

const messageMap: Record<string, Record<string, unknown>> = {
  'zh-CN': zhCN as Record<string, unknown>,
  'en': en as Record<string, unknown>,
}

export function t(locale: string, path: string, fallback?: string): string {
  const msg = messageMap[locale] || messageMap['zh-CN']
  if (!msg) return fallback ?? path

  const keys = path.split('.')
  let val: unknown = msg
  for (const key of keys) {
    if (val && typeof val === 'object' && key in val) {
      val = (val as Record<string, unknown>)[key]
    } else {
      return fallback ?? path
    }
  }
  return typeof val === 'string' ? val : (fallback ?? path)
}