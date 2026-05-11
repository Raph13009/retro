#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$ROOT_DIR/scripts/ensure-local-node.sh"

export PATH="$ROOT_DIR/.local-node/bin:$PATH"

# Cursor terminals can keep old placeholder env vars in memory. Let Next load
# the current saved .env.local instead of inheriting stale shell values.
unset NEXT_PUBLIC_SUPABASE_URL
unset NEXT_PUBLIC_SUPABASE_ANON_KEY

if pgrep -f "$ROOT_DIR/node_modules/.bin/next dev" >/dev/null 2>&1; then
  echo "Retro is already running: http://127.0.0.1:3000"
  echo "Stop it with: pkill -f \"$ROOT_DIR/node_modules/.bin/next dev\""
  exit 0
fi

if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
  npm install
fi

exec npm run dev
