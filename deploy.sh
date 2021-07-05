#!/bin/bash
set -euo pipefail

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Build dependencies
pnpm build:static
pnpm build:sw

# Publish site and Cloudflare worker
pnpm wrangler publish
