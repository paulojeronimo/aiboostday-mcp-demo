#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing npm dependencies for data-translator-mcp..."
(
  cd "$SCRIPT_DIR"
  npm install
  npm run build
)

if ! command -v codex >/dev/null 2>&1; then
  echo "codex CLI not found in PATH. Please install Codex before running this script."
  exit 1
fi

NODE_BIN="$(command -v node)"
if [[ -z "$NODE_BIN" ]]; then
  echo "node executable not found. Please ensure Node.js is installed."
  exit 1
fi

if codex mcp list | grep -q 'data-translator-mcp'; then
  echo "Codex already has an entry for data-translator-mcp."
else
  echo "Registering data-translator-mcp with Codex..."
  cat <<EOF >>~/.codex/config.toml
[mcp_servers.data-translator-mcp]
cwd = "$SCRIPT_DIR"
command = "node"
args = ["dist/server.js"]
EOF
fi

echo "Done. Run 'codex mcp list' to confirm the server is available (Cwd column should show $SCRIPT_DIR)."
