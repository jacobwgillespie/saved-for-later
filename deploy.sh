#!/bin/bash
set -euo pipefail

if [ -f .env ]; then
  source .env
fi

yarn build:sw
wrangler publish
