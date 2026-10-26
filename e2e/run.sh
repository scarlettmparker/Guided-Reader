#!/usr/bin/env bash
#
# Installs Playwright if needed, then runs the Guided-Reader functional tests.
#
# Usage:
#   ./run.sh                 # all tests
#   ./run.sh --headed
#   ./run.sh --grep=library

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node 20+ is required. Install it before running the Playwright suite." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install it before running the Playwright suite." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  echo "Node $(node -v) is too old. Node 20+ is required." >&2
  exit 1
fi

if [[ -f "${E2E_ENV_FILE:-$HOME/.config/sun-e2e.env}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${E2E_ENV_FILE:-$HOME/.config/sun-e2e.env}"
  set +a
fi

export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"

LOCK_HASH="$(sha256sum package-lock.json | cut -d' ' -f1)"
STAMP="$SCRIPT_DIR/node_modules/.playwright-stamp"

if [[ ! -x node_modules/.bin/playwright ]] || [[ "$(cat "$STAMP" 2>/dev/null)" != "$LOCK_HASH" ]]; then
  npm ci --no-audit --no-fund
  printf '%s\n' "$LOCK_HASH" > "$STAMP"
fi

if ! node -e "const { chromium } = require('@playwright/test'); process.exit(require('node:fs').existsSync(chromium.executablePath()) ? 0 : 1)"; then
  ./node_modules/.bin/playwright install chromium
fi

exec ./node_modules/.bin/playwright test "$@"
