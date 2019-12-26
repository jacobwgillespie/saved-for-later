#!/bin/bash
set -euo pipefail

if [ -f .env ]; then
  source .env
fi

wrangler publish
