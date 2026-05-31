#!/bin/bash
set -e

echo "=== CopyCraft Deploy ==="
echo ""

echo "1. Running checks..."
bash "$(dirname "$0")/check.sh"

echo ""
echo "2. Pushing to GitHub..."
git push

echo ""
echo "3. Triggering Vercel deploy..."
echo "   Done! Vercel auto-deploys on push."
echo "   URL: https://copycraft-mauve.vercel.app"
echo ""
echo "=== Deploy complete ==="