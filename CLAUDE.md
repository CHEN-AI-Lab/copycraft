# CopyCraft (文案宝)

AI-powered copywriting tool with bilingual (zh-CN / en) support.

## Tech Stack
- Next.js 15 (App Router) + TypeScript strict + Tailwind CSS
- next-intl for i18n
- Vercel deployment

## Directory Structure
```
apps/web/     → Next.js web app (main deliverable)
shared/       → Shared types, utils, API client
docs/         → ADR, progress, decisions
scripts/      → setup, check, deploy
```

## Commands
```bash
pnpm dev       # Start dev server (apps/web)
pnpm build     # Production build
pnpm lint      # Lint check
pnpm test      # Run tests
```

## Architecture
- Monorepo (pnpm workspace), single web app for now
- i18n: next-intl, messages/ zh-CN + en, cookie persistence
- AI: API route calls LLM → returns generated copy
- Payment: Creem (to be added in Phase 2)
- No auth for MVP (free tier, rate-limited by IP)
