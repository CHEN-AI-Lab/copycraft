#!/bin/bash
set -e

echo "=== CopyCraft Setup ==="
pnpm install
echo "=== Dependencies installed ==="

if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.example apps/web/.env.local
  echo "=== Created .env.local from .env.example ==="
fi

echo "=== Setup complete ==="