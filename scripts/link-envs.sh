#!/usr/bin/env bash
# =============================================================================
# link-envs.sh — Distribute credentials from global.env to per-app env files
# =============================================================================
# Source of truth: /home/ubuntu/workspace/global.env
# Reads from it and writes to each app's env file.
# Run:  bash scripts/link-envs.sh
# =============================================================================

set -euo pipefail

GLOBAL_ENV="/home/ubuntu/workspace/global.env"

if [ ! -f "$GLOBAL_ENV" ]; then
  echo "Error: $GLOBAL_ENV not found" >&2
  exit 1
fi

# ── Parse key=value from global.env (skip blanks, skip comments) ──
_env() {
  local key="$1"
  grep "^${key}=" "$GLOBAL_ENV" | head -1 | cut -d= -f2-
}

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ════════════════════════════════════════════════════════════════════════════
# Web (Next.js) — apps/web/.env.local
# ════════════════════════════════════════════════════════════════════════════
cat > "$PROJECT_ROOT/apps/web/.env.local" << EOF
# ── AI API ──
AI_API_KEY=$(_env AI_API_KEY)
AI_BASE_URL=$(_env AI_BASE_URL)
AI_MODEL=$(_env AI_MODEL)

# ── Payments (Creem) — test keys for local dev ──
CREEM_API_KEY=$(_env CREEM_API_KEY)
CREEM_PRODUCT_ID=$(_env CREEM_PRODUCT_ID)
CREEM_WEBHOOK_SECRET=$(_env CREEM_WEBHOOK_SECRET)

# ── Supabase — staging/test for local dev ──
NEXT_PUBLIC_SUPABASE_URL=$(_env STAGING_NEXT_PUBLIC_SUPABASE_URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(_env STAGING_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
SUPABASE_SERVICE_ROLE_KEY=$(_env STAGING_SUPABASE_SERVICE_ROLE_KEY)

# ── App URL (local dev) ──
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Admin ──
ADMIN_EMAILS=$(_env ADMIN_EMAILS)
EOF

echo "  ✓ apps/web/.env.local"

# ════════════════════════════════════════════════════════════════════════════
# MiniProgram (微信小程序) — apps/weapp/.env.json
# ════════════════════════════════════════════════════════════════════════════
# mkdir -p "$PROJECT_ROOT/apps/weapp"
# cat > "$PROJECT_ROOT/apps/weapp/.env.json" << EOF
# {
#   "AI_API_KEY": "$(_env AI_API_KEY)",
#   "AI_BASE_URL": "$(_env AI_BASE_URL)",
#   "AI_MODEL": "$(_env AI_MODEL)",
#   "NEXT_PUBLIC_SUPABASE_URL": "$(_env STAGING_NEXT_PUBLIC_SUPABASE_URL)",
#   "NEXT_PUBLIC_SUPABASE_ANON_KEY": "$(_env STAGING_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
# }
# EOF
# echo "  ✓ apps/weapp/.env.json"

# ════════════════════════════════════════════════════════════════════════════
# Mobile App (React Native) — apps/app/.env (future)
# ════════════════════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════════════════════
# Desktop — apps/desktop/.env (future)
# ════════════════════════════════════════════════════════════════════════════

echo ""
echo "Done. All env files written from global.env"