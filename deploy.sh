#!/bin/bash
set -euo pipefail

if [ -f .env ]; then
  source .env
fi

export CF_EMAIL="$CLOUDFLARE_EMAIL"
export CF_API_KEY="$CLOUDFLARE_TOKEN"

wrangler publish
