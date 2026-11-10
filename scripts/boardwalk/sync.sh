#!/usr/bin/env bash
# Puts the Boardwalk park at the front of this site: the page in public/index.html, every other file on Cloudflare
# R2 (https://promos.infinityopus.com/park/<version>/). Details in sync.mjs.
#
#   bash scripts/boardwalk/sync.sh [--dry]
set -euo pipefail
cd "$(dirname "$0")/../.."
exec node scripts/boardwalk/sync.mjs "$@"
