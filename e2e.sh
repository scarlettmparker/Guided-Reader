#!/usr/bin/env bash
#
# Build the sun-graphql backend image (from the Sun repo) and run the
# Guided-Reader functional-test stack.
#
# Usage:
#   ./e2e.sh                     # build the app image, then run the suite headless
#   ./e2e.sh up                  # bring up db + backend + app detached, no tests
#   ./e2e.sh open                # bring the stack up, then `npx cypress open` on the host
#   ./e2e.sh down                # stop the stack and wipe the DB volume
#   ./e2e.sh --no-cache          # rebuild the app image without docker layer cache
#   ./e2e.sh --rebuild-backend   # force a rebuild of the sun-graphql image
#   ./e2e.sh --outputs           # record cypress video

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE="docker compose -f docker-compose.e2e.yml"
SUN_DIR="${SUN_DIR:-$(cd "$SCRIPT_DIR/../Sun" && pwd)}"
BACKEND_IMAGE="sun-graphql:dev"
BACKEND_BUILD_CTX="$SUN_DIR/components"
BACKEND_DOCKERFILE="$BACKEND_BUILD_CTX/sun-graphql/Dockerfile"

REBUILD_BACKEND=0
APP_NO_CACHE=0
COMMAND="run"
for arg in "$@"; do
  case "$arg" in
    --rebuild-backend) REBUILD_BACKEND=1 ;;
    --no-cache) APP_NO_CACHE=1 ;;
    --outputs|--outputs=true|--outputs=1) export CYPRESS_CAPTURE_OUTPUTS=true ;;
    up|open|down) COMMAND="$arg" ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

build_backend_if_needed() {
  if [[ "$REBUILD_BACKEND" -eq 1 ]] || ! docker image inspect "$BACKEND_IMAGE" >/dev/null 2>&1; then
    if [[ ! -f "$BACKEND_DOCKERFILE" ]]; then
      echo "Backend Dockerfile not found at $BACKEND_DOCKERFILE" >&2
      echo "Set SUN_DIR to point at your Sun repo checkout." >&2
      exit 1
    fi
    echo "==> Building $BACKEND_IMAGE from $SUN_DIR (this is slow the first time)"
    docker build -f "$BACKEND_DOCKERFILE" -t "$BACKEND_IMAGE" "$BACKEND_BUILD_CTX"
  else
    echo "==> $BACKEND_IMAGE already built (use --rebuild-backend to rebuild after Java changes)"
  fi
}

APP_IMAGE="guided-reader-e2e-app:latest"

build_app() {
  local hash
  hash=$(
    {
      cat Dockerfile package.json package-lock.json vite.config.ts tsconfig.json 2>/dev/null
      find src routes server.js css-loader.mjs -type f -not -path "*/node_modules/*" 2>/dev/null \
        | sort | xargs cat 2>/dev/null
    } | sha1sum | cut -c1-12
  )
  local cache_tag="guided-reader-e2e-app:${hash}"

  if [[ "$APP_NO_CACHE" -eq 1 ]]; then
    echo "==> --no-cache: rebuilding app image from scratch…"
    $COMPOSE build --no-cache app
    docker tag "$APP_IMAGE" "$cache_tag"
    return
  fi

  if docker image inspect "$cache_tag" >/dev/null 2>&1; then
    echo "==> Reusing cached app image ($cache_tag) - no source changes detected."
    docker tag "$cache_tag" "$APP_IMAGE"
    return
  fi

  echo "==> Building app image (vite build runs inside)… [new hash $hash]"
  $COMPOSE build app
  docker tag "$APP_IMAGE" "$cache_tag"
}

case "$COMMAND" in
  down)
    $COMPOSE down -v
    ;;
  up)
    build_backend_if_needed
    build_app
    $COMPOSE up -d db backend app
    echo "Stack is up. App at http://localhost:3000 - stop with: ./e2e.sh down"
    ;;
  open)
    build_backend_if_needed
    build_app
    $COMPOSE up -d db backend app
    echo "Opening Cypress against http://localhost:3000 ..."
    npx cypress open
    ;;
  run)
    build_backend_if_needed
    build_app
    code=0
    $COMPOSE up --abort-on-container-exit --exit-code-from cypress || code=$?
    $COMPOSE down -v --remove-orphans
    exit "$code"
    ;;
esac
