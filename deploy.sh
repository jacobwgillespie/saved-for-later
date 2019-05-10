#!/bin/bash
set -euo pipefail

if [ -f .env ]; then
  source .env
fi

curl \
  -X PUT \
  "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE/workers/script" \
  -H "X-Auth-Email:$CLOUDFLARE_EMAIL" \
  -H "X-Auth-Key:$CLOUDFLARE_TOKEN" \
  -H "Content-Type:application/javascript" \
  --data-binary "@./dist/worker.js"
