#!/bin/bash
pnpm tsc --noEmit && pnpm lint && echo "All checks passed."
