#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$ROOT_DIR/scripts/ensure-local-node.sh"

export PATH="$ROOT_DIR/.local-node/bin:$PATH"

if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
  npm install
fi

exec npm run dev
