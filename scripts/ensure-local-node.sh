#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="v24.15.0"
NODE_DIR="$ROOT_DIR/.local-node"
NODE_BIN="$NODE_DIR/bin/node"
NPM_BIN="$NODE_DIR/bin/npm"

if [[ -x "$NODE_BIN" && -x "$NPM_BIN" ]]; then
  exit 0
fi

mkdir -p "$NODE_DIR"

ARCH="$(uname -m)"
case "$ARCH" in
  arm64) NODE_ARCH="arm64" ;;
  x86_64) NODE_ARCH="x64" ;;
  *)
    echo "Unsupported macOS architecture: $ARCH" >&2
    exit 1
    ;;
esac

ARCHIVE="node-$NODE_VERSION-darwin-$NODE_ARCH.tar.gz"
URL="https://nodejs.org/dist/$NODE_VERSION/$ARCHIVE"

echo "Installing local Node.js $NODE_VERSION..."
curl -fsSL "$URL" -o "$NODE_DIR/node.tar.gz"
tar -xzf "$NODE_DIR/node.tar.gz" -C "$NODE_DIR" --strip-components=1
rm "$NODE_DIR/node.tar.gz"

echo "Local Node ready: $("$NODE_BIN" --version), npm $("$NPM_BIN" --version)"
