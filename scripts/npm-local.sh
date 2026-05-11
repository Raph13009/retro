#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$ROOT_DIR/scripts/ensure-local-node.sh"

export PATH="$ROOT_DIR/.local-node/bin:$PATH"
exec npm "$@"
