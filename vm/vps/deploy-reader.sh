#!/usr/bin/env bash
set -euo pipefail

SELF="$(readlink -f "${BASH_SOURCE[0]}")"
HERE="$(dirname "$SELF")"
REPO="$(cd "$HERE/../.." && pwd)"
VPS="${VPS:-ubuntu@vps.scarlettparker.co.uk}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/ubuntu.key}"
CONTAINER=cassini
REMOTE_TMP=/tmp/sun-vps
ENV_FILE="$REPO/.env"
BUN="${BUN:-$HOME/.bun/bin/bun}"
SKIP_BUILD=0
[ "${1:-}" = "--skip-build" ] && SKIP_BUILD=1

# Prints a status line.
#
# @param $@ Message parts.
log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }

# Runs a command on the VPS.
#
# @param $@ Command and arguments.
remote() { ssh -i "$SSH_KEY" -o BatchMode=yes "$VPS" "$@"; }

# Reads one key from the local env.
#
# @param $1 Key name.
envval() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | head -n1 | cut -d= -f2- || true; }

# Copies a file into the container.
#
# @param $1 Local path.
# @param $2 Container path.
push_file() {
  local local_path="$1" remote_path="$2"
  remote "sudo lxc exec '$CONTAINER' -- rm -f '$remote_path'"
  remote "sudo lxc file push -q -p --mode 0644 '$REMOTE_TMP/$(basename "$local_path")' '$CONTAINER$remote_path'"
}

# Builds the frontend and snapshot dependencies.
build() {
  local log
  if [ "$SKIP_BUILD" = "0" ]; then
    log "build: Guided Reader"
    log="$(mktemp "${TMPDIR:-/tmp}/reader-build.XXXXXX.log")"
    if ! (cd "$REPO" && "$BUN" run build >"$log" 2>&1); then
      cat "$log" >&2
      rm -f "$log"
      return 1
    fi
    rm -f "$log"
  fi
  log "deps: ARM64 node_modules"
  remote "rm -rf /tmp/reader-deps && mkdir -p /tmp/reader-deps"
  rsync -az -e "ssh -i $SSH_KEY" \
    "$REPO/package.json" "$REPO/bun.lock" "$REPO/bunfig.toml" \
    "$VPS:/tmp/reader-deps/"
  remote "cd /tmp/reader-deps && /home/ubuntu/.bun/bin/bun install --production --frozen-lockfile --no-progress"
  remote "cd /tmp/reader-deps && tar -czf /tmp/reader-deps.tgz node_modules"
}

# Renders the container env.
#
# @param $1 Output path.
render_env() {
  local out="$1"
  umask 077
  cp "$ENV_FILE" "$out"
  sed -i \
    -e 's|^GRAPHQL_ENDPOINT=.*|GRAPHQL_ENDPOINT=http://10.89.20.202:8083/graphql|' \
    -e 's|^SERVER_HOST=.*|SERVER_HOST=0.0.0.0|' \
    -e 's|^SERVER_PORT=.*|SERVER_PORT=5178|' \
    -e 's|^VITE_SERVER_BASE=.*|VITE_SERVER_BASE=https://reader.scarlettparker.co.uk|' \
    -e 's|^ALLOWED_HOSTS=.*|ALLOWED_HOSTS=reader.scarlettparker.co.uk,localhost|' \
    -e 's|^ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=reader.scarlettparker.co.uk,localhost|' \
    -e 's|^DISCORD_REDIRECT_URI=.*|DISCORD_REDIRECT_URI=https://reader.scarlettparker.co.uk/auth/discord/callback|' \
    -e 's|^CLIENT_ID=.*|CLIENT_ID=guided-reader|' \
    "$out"
}

deploy() {
  local app_tar tmp
  build
  remote "mkdir -p $REMOTE_TMP"
  app_tar="$(mktemp -d)/reader.tgz"
  tar -czf "$app_tar" -C "$REPO" \
    dist/client dist/server server.js config.js config.d.ts css-plugin.ts \
    package.json tsconfig.json bunfig.toml bun.lock .bun-version routes messages src

  remote "sudo lxc exec '$CONTAINER' -- mkdir -p /opt/guided-reader"
  remote "sudo lxc exec '$CONTAINER' -- bash -c 'find /opt/guided-reader -mindepth 1 -maxdepth 1 ! -name node_modules ! -name .env.production -exec rm -rf {} +'"
  rsync -az -e "ssh -i $SSH_KEY" "$app_tar" "$VPS:$REMOTE_TMP/reader.tgz"
  remote "sudo lxc exec '$CONTAINER' -- rm -f /tmp/reader.tgz /tmp/reader-deps.tgz"
  remote "sudo lxc file push -q -p --mode 0644 '$REMOTE_TMP/reader.tgz' '$CONTAINER/tmp/reader.tgz'"
  remote "sudo lxc exec '$CONTAINER' -- tar -xzf /tmp/reader.tgz -C /opt/guided-reader"
  remote "sudo lxc exec '$CONTAINER' -- bash -c 'rm -rf /opt/guided-reader/node_modules'"
  remote "sudo lxc file push -q -p --mode 0644 /tmp/reader-deps.tgz '$CONTAINER/tmp/reader-deps.tgz'"
  remote "sudo lxc exec '$CONTAINER' -- tar -xzf /tmp/reader-deps.tgz -C /opt/guided-reader"

  if [ -f "$ENV_FILE" ]; then
    tmp="$(mktemp)"
    render_env "$tmp"
    rsync -az -e "ssh -i $SSH_KEY" "$tmp" "$VPS:$REMOTE_TMP/reader.env"
    remote "sudo lxc exec '$CONTAINER' -- rm -f /tmp/reader.env.tmp"
    remote "sudo lxc file push -q -p --mode 0600 '$REMOTE_TMP/reader.env' '$CONTAINER/tmp/reader.env.tmp'"
    remote "sudo lxc exec '$CONTAINER' -- mv /tmp/reader.env.tmp /opt/guided-reader/.env.production"
    rm -f "$tmp"
  fi

  rsync -az -e "ssh -i $SSH_KEY" "$HERE/files/guided-reader.service" "$VPS:$REMOTE_TMP/guided-reader.service"
  remote "sudo lxc file push -q -p --mode 0644 '$REMOTE_TMP/guided-reader.service' '$CONTAINER/etc/systemd/system/guided-reader.service'"
  remote "sudo lxc exec '$CONTAINER' -- systemctl daemon-reload"
  remote "sudo lxc exec '$CONTAINER' -- systemctl enable guided-reader"
  remote "sudo lxc exec '$CONTAINER' -- systemctl restart guided-reader"
  for _ in $(seq 1 60); do
    if remote "sudo lxc exec '$CONTAINER' -- curl -sf http://127.0.0.1:5178/ >/dev/null"; then
      log "reader: healthy"
      return 0
    fi
    sleep 1
  done
  remote "sudo lxc exec '$CONTAINER' -- journalctl -u guided-reader -n 60 --no-pager" || true
  return 1
}

deploy
