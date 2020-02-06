#!/bin/bash
set -euo pipefail

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Build dependencies
yarn build:static
yarn build:sw

# Publish site and Cloudflare worker
yarn wrangler publish
