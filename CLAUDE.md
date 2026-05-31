# CopyCraft — AI Copywriting Tool

## Tech Stack
- **Web**: Next.js 15 (App Router) + React 19 + TypeScript (strict)
- **Styling**: Tailwind CSS 4 + dark mode
- **Shared**: `shared/` (types, constants, validators, utils, API client)
- **State**: React hooks + Zustand (if needed)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deploy**: Vercel
- **Package Manager**: pnpm + Turborepo

## Project Structure
```
copycraft/
├── shared/          # Multi-platform shared layer
│   ├── types/       # DTOs, interfaces
│   ├── constants/   # Platform lists, tone/length options
│   ├── validators/  # Zod schemas
│   ├── utils/       # Pure utility functions
│   └── api/         # Unified API client
├── apps/
│   └── web/         # Next.js Web app
│       ├── src/app/[locale]/   # Pages (zh-CN, en)
│       └── src/components/     # React components
├── packages/
│   └── ui/          # Shared UI components
├── tests/
│   ├── unit/        # Vitest unit tests
│   └── e2e/         # Playwright E2E tests
├── scripts/         # Setup/check/deploy scripts
├── docs/            # Architecture, progress, decisions
└── .github/workflows/  # CI/CD
```

## Commands
```bash
pnpm dev              # Start dev server (web)
pnpm build            # Build for production
pnpm test             # Run unit tests
pnpm test:watch       # Unit tests in watch mode
pnpm test:e2e         # E2E tests (requires Playwright)
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check (shared + web)
pnpm check            # All checks (typecheck + lint + test + build)
bash scripts/setup.sh   # Fresh setup
bash scripts/check.sh   # Full quality check
bash scripts/deploy.sh  # Deploy to production
```

## Conventions
- `strict: true` in tsconfig, no `any` types
- All functions must have explicit parameter/return types
- `shared/` is pure TS — no platform APIs (no window, document, process.env)
- Shared types used across Web + future MiniProgram + App
- Bilingual support (zh-CN + en) via next-intl
- Every commit must pass `pnpm check`
