#!/bin/bash
set -euo pipefail

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Build dependencies
yarn build:static
yarn build:sw
yarn build:worker-webpack

# Publish site and Cloudflare worker
yarn wrangler publish
