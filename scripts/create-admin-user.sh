#!/usr/bin/env bash
# Create admin user directly in Supabase Auth + Prisma User table
# Usage: bash scripts/create-admin-user.sh <email> <password>

set -euo pipefail

EMAIL="${1:-}"
PASSWORD="${2:-}"

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "Usage: bash scripts/create-admin-user.sh <email> <password>"
  echo "Example: bash scripts/create-admin-user.sh admin@example.com MyP@ss123"
  exit 1
fi

# Validate password meets Supabase policy
if [ ${#PASSWORD} -lt 8 ]; then echo "Error: password must be at least 8 characters"; exit 1; fi
if ! echo "$PASSWORD" | grep -q '[a-z]'; then echo "Error: password needs lowercase"; exit 1; fi
if ! echo "$PASSWORD" | grep -q '[A-Z]'; then echo "Error: password needs uppercase"; exit 1; fi
if ! echo "$PASSWORD" | grep -q '[0-9]'; then echo "Error: password needs a number"; exit 1; fi

# Load env
cd "$(dirname "$0")/.."
if [ -f apps/web/.env.local ]; then
  export $(grep -v '^#' apps/web/.env.local | xargs)
fi
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
DATABASE_URL="${SUPABASE_DATABASE_URL:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  exit 1
fi

echo "=== Step 1: Create user in Supabase Auth ==="
AUTH_RESULT=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_confirm\":true}")

USER_ID=$(echo "$AUTH_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || true)

if [ -z "$USER_ID" ]; then
  echo "Auth response: $AUTH_RESULT"
  echo "Error: failed to create auth user"
  echo ""
  echo "Possible issues:"
  echo "  1. User already exists (try logging in instead)"
  echo "  2. Invalid service_role key"
  echo "  3. Supabase project not properly configured"
  exit 1
fi

echo "  ✅ Auth user created: $USER_ID"

echo "=== Step 2: Insert into User table (via Prisma) ==="
cd apps/web
npx prisma db execute --schema=../../prisma/schema.prisma \
  --stdin <<SQL
INSERT INTO "User" (id, email, "paid", "createdAt", "updatedAt")
VALUES ('$USER_ID', '$EMAIL', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET paid = true;
SQL

echo ""
echo "=== Done! ==="
echo "  Email: $EMAIL"
echo "  Paid:  true (admin access)"
echo ""
echo "Now go to https://copycraft-mauve.vercel.app/zh-CN/sign-in and log in."