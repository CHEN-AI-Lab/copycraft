#!/bin/bash
set -e

echo "=== CopyCraft Checks ==="
echo ""

echo "1. TypeScript check (shared)..."
cd "$(dirname "$0")/.."
pnpm --filter shared tsc --noEmit && echo "   ✅ shared" || { echo "   ❌ shared"; exit 1; }

echo "2. TypeScript check (web)..."
pnpm --filter web tsc --noEmit && echo "   ✅ web" || { echo "   ❌ web"; exit 1; }

echo "3. Lint..."
pnpm --filter web lint && echo "   ✅ lint" || { echo "   ❌ lint"; exit 1; }

echo "4. Unit tests..."
npx vitest run && echo "   ✅ tests" || { echo "   ❌ tests"; exit 1; }

echo "5. Build..."
pnpm --filter web build && echo "   ✅ build" || { echo "   ❌ build"; exit 1; }

echo ""
echo "=== All checks passed ==="