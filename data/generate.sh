#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

(
  cd "$ROOT_DIR"
  npx --prefix "${ROOT_DIR}/data" tsc -p data/tsconfig.json --outDir "$TMP_DIR" --rootDir data >/dev/null
  DATA_GENERATOR_ROOT="$ROOT_DIR" DATA_GENERATOR_DATA_DIR="$ROOT_DIR/data" node "$TMP_DIR/generate.js" "$@"
)
