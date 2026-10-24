#!/usr/bin/env bash
set -euo pipefail

VM="${VM:-ubuntu@vps.scarlettparker.co.uk}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/ubuntu.key}"
SSH="ssh -i $SSH_KEY $VM"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

DOMAIN="reader.scarlettparker.co.uk"
SERVICE="guided-reader"
DEPLOY_DIR="/opt/guided-reader"
LIVE_PORT=5178
STANDBY_PORT=15178

usage() {
  echo "Usage: deploy.sh [--skip-build]"
  exit 1
}

SKIP_BUILD="${1:-}"

build() {
  echo "==> Building Guided-Reader..."
  cd "$APP_DIR"
  bun run build --quiet
  echo "    dist/client/ $(du -sh dist/client | cut -f1)"
  echo "    dist/server/ $(du -sh dist/server | cut -f1)"
}

setup_vm() {
  echo "==> Setting up VM directories and systemd..."
  $SSH bash -s <<'REMOTE'
    mkdir -p ~/.config/systemd/user
    sudo mkdir -p /opt/guided-reader
    sudo chown ubuntu:ubuntu /opt/guided-reader
    sudo loginctl enable-linger ubuntu 2>/dev/null || true
REMOTE
  rsync -avz -e "ssh -i $SSH_KEY" \
    "$APP_DIR/vm/systemd/" "$VM:~/.config/systemd/user/"
}

deploy() {
  echo "==> Deploying Guided-Reader (zero-downtime blue-green) to VM..."

  # Rsync code
  $SSH "mkdir -p $DEPLOY_DIR/dist/client $DEPLOY_DIR/dist/server"
  rsync -avz --delete \
    -e "ssh -i $SSH_KEY" \
    --exclude node_modules \
    --exclude .env \
    --exclude .env.production \
    "$APP_DIR/dist/client/" "$VM:$DEPLOY_DIR/dist/client/"
  rsync -avz --delete \
    -e "ssh -i $SSH_KEY" \
    "$APP_DIR/dist/server/" "$VM:$DEPLOY_DIR/dist/server/"
  rsync -avz \
    -e "ssh -i $SSH_KEY" \
    "$APP_DIR/server.js" "$APP_DIR/config.js" \
    "$APP_DIR/config.d.ts" "$APP_DIR/css-plugin.ts" \
    "$APP_DIR/package.json" "$APP_DIR/tsconfig.json" \
    "$APP_DIR/bunfig.toml" "$APP_DIR/bun.lock" "$APP_DIR/.bun-version" \
    "$VM:$DEPLOY_DIR/"
  rsync -avz \
    -e "ssh -i $SSH_KEY" \
    "$APP_DIR/routes/" "$VM:$DEPLOY_DIR/routes/"
  rsync -avz \
    -e "ssh -i $SSH_KEY" \
    "$APP_DIR/messages/" "$VM:$DEPLOY_DIR/messages/"
  rsync -avz \
    -e "ssh -i $SSH_KEY" \
    --exclude node_modules \
    "$APP_DIR/src/" "$VM:$DEPLOY_DIR/src/"
  rsync -avz \
    -e "ssh -i $SSH_KEY" \
    "$APP_DIR/bunfig.toml" "$APP_DIR/bun.lock" "$VM:$DEPLOY_DIR/" 2>/dev/null || rsync -avz -e "ssh -i $SSH_KEY" "$APP_DIR/bunfig.toml" "$VM:$DEPLOY_DIR/"

  echo "    Installing production dependencies..."
  $SSH "export PATH=\$HOME/.bun/bin:\$PATH && command -v bun >/dev/null || curl -fsSL https://bun.sh/install | bash"
  $SSH "export PATH=\$HOME/.bun/bin:\$PATH && cd $DEPLOY_DIR && bun install --production --frozen-lockfile 2>/dev/null"

  # Zero-downtime blue-green swap
  $SSH bash -s <<'SWAP'
set -euo pipefail

LIVE_PORT=5178
STANDBY_PORT=15178
DOMAIN="reader.scarlettparker.co.uk"
SERVICE="guided-reader"

# Detect which port is currently live from the nginx config
CURRENT=$(grep -oP '127\.0\.0\.1:\K[0-9]+' "/etc/nginx/sites-enabled/$DOMAIN" 2>/dev/null || echo "$LIVE_PORT")
if [ "$CURRENT" = "$LIVE_PORT" ]; then
  NEW_PORT=$STANDBY_PORT
  SWAP_TO="standby"
else
  NEW_PORT=$LIVE_PORT
  SWAP_TO="live"
fi

echo "    Live: $CURRENT -> Deploying to: $NEW_PORT"

# Step 1: Start new instance on standby (old is still serving)
echo "    Starting new instance on port $NEW_PORT..."
systemctl --user start "$SERVICE@$NEW_PORT"

# Step 2: Health-check new instance (up to 30s)
echo "    Health-checking..."
HEALTHY=false
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:$NEW_PORT/" > /dev/null 2>&1; then
    echo "    Healthy after ${i}s"
    HEALTHY=true
    break
  fi
  sleep 1
done

if [ "$HEALTHY" != "true" ]; then
  echo "    HEALTH CHECK FAILED, rolling back"
  systemctl --user stop "$SERVICE@$NEW_PORT" 2>/dev/null || true
  exit 1
fi

# Step 3: Swap nginx to new instance (old is still running - no gap)
echo "    Swapping nginx to port $NEW_PORT..."
sudo ln -sf "/etc/nginx/sites-available/$DOMAIN.$SWAP_TO" "/etc/nginx/sites-enabled/$DOMAIN"
sudo nginx -t 2>&1 && sudo nginx -s reload 2>&1

# Step 4: Stop old instance (no longer receiving traffic)
echo "    Stopping old instance on port $CURRENT..."
systemctl --user stop "$SERVICE@$CURRENT" 2>/dev/null || true

echo "    Deploy complete: $DOMAIN now on port $NEW_PORT"
SWAP

  echo "    Guided-Reader deployed (zero-downtime)."
}

if [ "$SKIP_BUILD" != "--skip-build" ]; then
  build
fi

setup_vm
deploy

echo "==> Done."
