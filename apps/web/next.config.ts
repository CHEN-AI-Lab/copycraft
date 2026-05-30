import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Load env vars from workspace root (local dev only)
const workspaceEnv = resolve('/home/ubuntu/workspace/global.env')
if (existsSync(workspaceEnv)) {
  const content = readFileSync(workspaceEnv, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && val && !process.env[key]) {
      process.env[key] = val
    }
  }
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
}

export default withNextIntl(nextConfig)