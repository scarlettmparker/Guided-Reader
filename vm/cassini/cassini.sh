#!/usr/bin/env bash
#
# cassini: throwaway Incus container standing in for a Raspberry Pi 1 Model B+.
# Tunables live in cassini.conf.
#   ./cassini.sh provision              box: storage, network, limits, bun
#   ./cassini.sh deploy [--skip-build]  build, push, restart the app
#   ./cassini.sh status | shell | stop | start | destroy

set -euo pipefail

SELF="$(readlink -f "${BASH_SOURCE[0]}")"
VM_DIR="$(dirname "$SELF")"
REPO="$(cd "$VM_DIR/../.." && pwd)"
FILES="$VM_DIR/files"

# shellcheck source=cassini.conf
. "$VM_DIR/cassini.conf"

BUN="${BUN:-$HOME/.bun/bin/bun}"
STAGE="/tmp/opencode/cassini-stage"
PROD="/tmp/opencode/cassini-prod"
TLS="$VM_DIR/tls"
CA="$(mkcert -CAROOT 2>/dev/null || true)/rootCA.pem"

incus() { sudo incus "$@"; }
ic() { sudo incus exec "$NAME" -- "$@"; }

# Incus has no device-exists predicate so read the YAML listing.
device_exists() { incus config device show "$NAME" 2>/dev/null | grep -q "^$1:"; }

log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarn:\033[0m %s\n' "$*" >&2; }

# Read one KEY=value from the repo .env.
envval() { grep -E "^$1=" "$REPO/.env" 2>/dev/null | head -n1 | cut -d= -f2- || true; }

# ── storage ──────────────────────────────────────────────────────────────────

# Sparse loop image + ext4, mounted at POOL_DIR and registered as an Incus pool.
# Safe to re-run.
ensure_storage() {
  log "storage: $POOL_IMG ($STORAGE_SIZE) -> $POOL_DIR"
  sudo mkdir -p "$POOL_DIR"
  if [ ! -f "$POOL_IMG" ]; then
    sudo truncate -s "$STORAGE_SIZE" "$POOL_IMG"
    sudo mkfs.ext4 -q -F "$POOL_IMG"
  fi
  if ! mountpoint -q "$POOL_DIR"; then
    sudo mount -o loop "$POOL_IMG" "$POOL_DIR"
    sudo rmdir "$POOL_DIR/lost+found" 2>/dev/null || true
  fi
  grep -q "$POOL_DIR" /etc/fstab \
    || echo "$POOL_IMG $POOL_DIR ext4 loop,defaults,nofail 0 0" | sudo tee -a /etc/fstab >/dev/null
  incus storage show "$POOL" >/dev/null 2>&1 || incus storage create "$POOL" dir source="$POOL_DIR"
}

# ── network ──────────────────────────────────────────────────────────────────

# Managed bridge. dnsmasq stays off because pihole already owns host :53 and :67.
ensure_bridge() {
  if ! incus network show "$BRIDGE" >/dev/null 2>&1; then
    log "network: creating bridge $BRIDGE (dns/dhcp off, host owns :53/:67)"
    incus network create "$BRIDGE" --type=bridge \
      ipv4.address="$BRIDGE_CIDR" \
      ipv4.nat=true \
      ipv4.dhcp=false \
      ipv6.address=none \
      dns.mode=none
  fi
}

# Open only what the box needs: reach the backend and pihole on the host, and
# let the LAN reach the proxy port.
ensure_ufw() {
  log "firewall: container -> host :8083 and :53, LAN -> :$HOST_PORT"
  sudo ufw allow in on "$BRIDGE" to any port 8083 proto tcp >/dev/null 2>&1 || true
  sudo ufw allow in on "$BRIDGE" to any port 53 >/dev/null 2>&1 || true
  sudo ufw allow "$HOST_PORT"/tcp >/dev/null 2>&1 || true
}

# Points HOST_ALIAS at loopback so the browser on windcatcher can find it.
ensure_hosts() {
  grep -qE "[[:space:]]$HOST_ALIAS\$" /etc/hosts \
    || echo "127.0.0.1 $HOST_ALIAS" | sudo tee -a /etc/hosts >/dev/null
}

# ── container ────────────────────────────────────────────────────────────────

# Wait for systemd inside the container. "degraded" still counts as up, since
# containers usually have some dead unit we don't care about.
wait_boot() {
  local i state
  for i in $(seq 1 60); do
    state="$(ic systemctl is-system-running 2>/dev/null || true)"
    case "$state" in running | degraded) return 0 ;; esac
    sleep 1
  done
  warn "container did not report a running systemd within 60s"
}

# Launches the instance if it doesn't exist, attaches its NIC and proxy
# devices, then pins the Pi limits. Idempotent.
ensure_container() {
  if ! incus info "$NAME" >/dev/null 2>&1; then
    log "container: launching $NAME from $IMAGE on pool $POOL"
    incus launch "$IMAGE" "$NAME" --storage "$POOL"
  fi
  incus start "$NAME" 2>/dev/null || true
  wait_boot

  device_exists eth0 \
    || incus config device add "$NAME" eth0 nic network="$BRIDGE" name=eth0

  device_exists web \
    || incus config device add "$NAME" web proxy \
         listen=tcp:0.0.0.0:"$HOST_PORT" connect=tcp:127.0.0.1:"$CONTAINER_PORT"

  incus config set "$NAME" boot.autostart true
  incus config set "$NAME" limits.cpu "$LIMITS_CPU"
  incus config set "$NAME" limits.cpu.allowance "$CPU_ALLOWANCE"
  incus config set "$NAME" limits.memory "$MEMORY"
  incus config set "$NAME" limits.memory.enforce hard
  incus config set "$NAME" limits.memory.swap false
}

# Push bun, the static NIC config, the eth0 throttle unit and nginx into the
# container.
configure_guest() {
  log "guest: hostname, static NIC, throttle unit, bun, nginx"
  ic hostnamectl set-hostname "$NAME" >/dev/null 2>&1 || true

  # Only install bun when it's missing. Overwriting it while the app is running
  # fails with "text file busy".
  ic test -x "$BUN_BIN" || sudo incus file push -q -p --mode 0755 "$BUN" "$NAME$BUN_BIN"

  # nginx-light terminates TLS inside the box
  if ! ic dpkg -s nginx-light >/dev/null 2>&1; then
    log "guest: installing nginx-light"
    ic env DEBIAN_FRONTEND=noninteractive apt-get update -qq
    ic env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
      -o Dpkg::Options::=--force-confold nginx-light
  fi

  sudo incus file push -q -p --mode 0644 \
    "$FILES/10-cassini.network" "$NAME/etc/systemd/network/10-cassini.network"
  sudo incus file push -q -p --mode 0644 \
    "$FILES/cassini-net-tune.service" "$NAME/etc/systemd/system/cassini-net-tune.service"

  ic systemctl restart systemd-networkd >/dev/null 2>&1 || true
  ic systemctl daemon-reload >/dev/null 2>&1 || true
  ic systemctl mask systemd-networkd-wait-online.service >/dev/null 2>&1 || true
  ic systemctl enable --now cassini-net-tune.service >/dev/null 2>&1 || true
}

# Throttles the loop device backing the container's storage, which is the
# whole filesystem for this box.
throttle_io() {
  local dev majmin cg
  dev="$(findmnt -no SOURCE "$POOL_DIR" 2>/dev/null)"
  [ -n "$dev" ] || return 0
  majmin="$(cat "/sys/class/block/$(basename "$dev")/dev" 2>/dev/null)" || return 0
  cg="/sys/fs/cgroup/lxc.payload.$NAME"
  if echo "$majmin rbps=$IO_READ_BPS wbps=$IO_WRITE_BPS" | sudo tee "$cg/io.max" >/dev/null 2>&1; then
    log "disk: capped $dev ($majmin) at read=$IO_READ_BPS write=$IO_WRITE_BPS B/s"
  else
    warn "disk: no io.max at $cg, skipping throttle"
  fi
}

# Full box setup. Each step checks before it acts, so running it twice is safe.
provision() {
  ensure_storage
  ensure_bridge
  ensure_container
  ensure_ufw
  ensure_hosts
  configure_guest
  throttle_io
  push_tls
  log "provisioned. browser: https://$HOST_ALIAS:$HOST_PORT/"
}

# Generate the site certificate with mkcert when it isn't there yet.
ensure_cert() {
  [ -f "$TLS/cassini.pem" ] && return 0
  command -v mkcert >/dev/null 2>&1 || {
    warn "mkcert missing, cannot issue a certificate"
    return 1
  }
  mkdir -p "$TLS"
  # shellcheck disable=SC2086
  mkcert -cert-file "$TLS/cassini.pem" -key-file "$TLS/cassini-key.pem" $TLS_NAMES >/dev/null
}

# Copy the cert and key into the container, with the key readable only by root.
push_tls() {
  log "tls: $TLS -> $NAME:$CONTAINER_TLS_DIR"
  ensure_cert
  sudo incus file push -q -p --mode 0644 \
    "$TLS/cassini.pem" "$NAME$CONTAINER_TLS_DIR/cassini.pem"
  sudo incus file push -q -p --mode 0600 \
    "$TLS/cassini-key.pem" "$NAME$CONTAINER_TLS_DIR/cassini-key.pem"
}

# ── app ──────────────────────────────────────────────────────────────────────

# Vite client + server build. Output is captured so a failure actually fails
# the deploy instead of vanishing into a pipe.
build_app() {
  log "build: client + server"
  local logfile="/tmp/opencode/cassini-build.log"
  if ! (cd "$REPO" && "$BUN" run build) >"$logfile" 2>&1; then
    tail -n 40 "$logfile" >&2
    return 1
  fi
  grep -E 'dist/|built in' "$logfile" | tail -n 6 || true
}

# Installs a dependencies-only node_modules into a scratch dir on the host, so
# the container never has to reach the private registry.
build_prod_deps() {
  log "build: production node_modules"
  rm -rf "$PROD" && mkdir -p "$PROD"
  cp "$REPO/package.json" "$REPO/bun.lock" "$REPO/bunfig.toml" "$PROD/"
  (cd "$PROD" && "$BUN" install --production --frozen-lockfile >/dev/null 2>&1)
}

# Write the container's .env.production from cassini.conf and the shared client,
# posthog and discord keys.
write_env() {
  cat > "$STAGE/.env.production" <<EOF
GRAPHQL_ENDPOINT=$GRAPHQL_ENDPOINT
SERVER_HOST=0.0.0.0
SERVER_PORT=$APP_PORT
VITE_SERVER_BASE=/
ALLOWED_HOSTS=$HOST_ALIAS,localhost
CLIENT_ID=$CLIENT_ID
CLIENT_SECRET=$(envval CLIENT_SECRET)
ALLOWED_ORIGINS=$HOST_ALIAS,localhost
POSTHOG_API_KEY=$(envval POSTHOG_API_KEY)
POSTHOG_HOST=$(envval POSTHOG_HOST)
DISCORD_CLIENT_ID=$(envval DISCORD_CLIENT_ID)
DISCORD_GUILD_ID=$(envval DISCORD_GUILD_ID)
DISCORD_REDIRECT_URI=http://$HOST_ALIAS:$HOST_PORT/auth/discord/callback
DISCORD_SCOPES=$(envval DISCORD_SCOPES)
EOF
}

# Collect the build output, the runtime sources bun needs (routes, src, messages),
# tsconfig for the ~/ path alias, and prod node_modules into one tree.
stage() {
  log "stage: assembling $STAGE"
  rm -rf "$STAGE" && mkdir -p "$STAGE"
  (cd "$REPO" && cp -r dist server.js config.js config.d.ts css-plugin.ts \
      tsconfig.json global.d.ts package.json bunfig.toml bun.lock .bun-version "$STAGE/")
  (cd "$REPO" && cp -r routes src messages "$STAGE/")
  cp -r "$PROD/node_modules" "$STAGE/node_modules"
  write_env
}

# Tar the stage in, unpack over APP_DIR, install the systemd units and the nginx
# site, then restart the app and nginx.
push_app() {
  log "push: $STAGE -> $NAME:$APP_DIR"
  local tar="/tmp/opencode/cassini-stage.tgz"
  tar -C "$STAGE" -czf "$tar" .
  ic mkdir -p "$APP_DIR"
  ic rm -f /tmp/cassini-stage.tgz
  sudo incus file push -q --mode 0600 "$tar" "$NAME/tmp/cassini-stage.tgz"
  ic tar -xzf /tmp/cassini-stage.tgz -C "$APP_DIR"
  ic chown -R root:root "$APP_DIR"
  ic rm -f /tmp/cassini-stage.tgz

  sudo incus file push -q -p --mode 0644 \
    "$FILES/guided-reader.service" "$NAME/etc/systemd/system/guided-reader.service"
  sudo incus file push -q -p --mode 0644 \
    "$FILES/cassini-nginx.conf" "$NAME/etc/nginx/sites-available/cassini"

  ic ln -sf /etc/nginx/sites-available/cassini /etc/nginx/sites-enabled/cassini
  ic rm -f /etc/nginx/sites-enabled/default

  ic systemctl daemon-reload
  ic systemctl enable guided-reader.service nginx.service >/dev/null 2>&1 || true
  ic systemctl restart guided-reader.service
  ic nginx -t
  ic systemctl restart nginx.service
}

# Build unless told to skip, then stage and push.
deploy() {
  [ "${1:-}" = "--skip-build" ] || build_app
  build_prod_deps
  push_tls
  stage
  push_app
  log "deployed. browser: https://$HOST_ALIAS:$HOST_PORT/"
}

# ── misc ─────────────────────────────────────────────────────────────────────

# Container list, service state, and a timing on the login page.
# TODO: will want a health check on guided reader itself, we do this through
# sun's /status which checks the service directly (we can't do that here)
status() {
  incus list "$NAME" 2>/dev/null || true
  log "service"
  ic systemctl --no-pager --lines=0 status guided-reader.service 2>&1 | head -n 6 || true
  log "http"
  curl -s --cacert "$CA" -o /dev/null -w 'https %{http_code} in %{time_total}s\n' \
    "https://$HOST_ALIAS:$HOST_PORT/login" || warn "no response yet"
}

case "${1:-}" in
  provision) provision ;;
  deploy) shift; deploy "${1:-}" ;;
  status) status ;;
  shell) shift; sudo incus exec "$NAME" -- bash -l ;;
  stop) incus stop "$NAME" ;;
  start) incus start "$NAME" ;;
  destroy)
    incus delete --force "$NAME" 2>/dev/null || true
    log "deleted $NAME (pool + loop image left in place)"
    ;;
  *) grep -E '^# ' "$SELF" | head -n 5; exit 1 ;;
esac
