#!/usr/bin/env bash
#
# Runs a cassini load test end to end: seeds accounts, samples the container's
# cgroup, drives k6 against the app, then collects the logs and a summary.
#
#   ./run.sh 50                    # 50 users for 30s
#   USERS=100 DURATION=60s ./run.sh
#   SWEEP="10 25 50 100" ./run.sh  # climb until it breaks
#
# Everything lands under load/runs/<timestamp>-<users>u/.

set -euo pipefail

LOAD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(git -C "$LOAD_DIR" rev-parse --show-toplevel)"
RUNS="$LOAD_DIR/runs"

# PG* from the backend env, then cassini's target names.
# shellcheck source=pg-env.sh
source "$LOAD_DIR/pg-env.sh"
# shellcheck source=../cassini.conf
source "$LOAD_DIR/../cassini.conf"
export NAME HOST_ALIAS HOST_PORT

if [ -n "${1:-}" ] && [ "${1:0:2}" != "--" ]; then
  USERS="$1"
  shift || true
fi

USERS="${USERS:-25}"
DURATION="${DURATION:-30s}"
THINK_MS="${THINK_MS:-300}"
WRITE_SHARE="${WRITE_SHARE:-0.2}"
WRITE_THINK_MS="${WRITE_THINK_MS:-16000}"
VIEWS="${VIEWS:-10}"
BASE_URL="${BASE_URL:-https://$HOST_ALIAS:$HOST_PORT}"
K6_IMAGE="${K6_IMAGE:-grafana/k6}"
BUN="${BUN:-$HOME/.bun/bin/bun}"

log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }

# Pulls p95/p99/error out of a k6 summary export as a tab-separated row.
summarize() {
  SUMMARY="$1" "$BUN" -e '
const fs = require("fs");
const s = JSON.parse(fs.readFileSync(process.env.SUMMARY, "utf8"));
const m = s.metrics || {};
const v = (name) => (m[name] ? m[name].values : {}) || {};
const dur = v("http_req_duration");
const failed = v("http_req_failed");
const checks = v("checks");
const row = [
  (dur["p(95)"] ?? 0).toFixed(0),
  (dur["p(99)"] ?? 0).toFixed(0),
  ((failed.rate ?? 0) * 100).toFixed(2),
  ((checks.rate ?? 0) * 100).toFixed(2),
];
console.log(row.join("\t"));
'
}

# Seeds, samples, runs k6 and collects the artefacts for one user count.
one_run() {
  local users="$1"
  local out="$RUNS/$(date +%Y%m%d-%H%M%S)-${users}u"
  local start
  mkdir -p "$out"
  start="$(date +%s)"

  log "seed: $users user(s)"
  USERS="$users" VIEWS="$VIEWS" "$BUN" "$LOAD_DIR/seed.ts" | tee "$out/seed.txt"

  log "sample: $out/resources.csv"
  "$LOAD_DIR/sample.sh" "$out/resources.csv" 1 &
  local sampler=$!
  trap 'kill '"$sampler"' 2>/dev/null || true' RETURN

  log "k6: $users user(s) for $DURATION against $BASE_URL"
  local k6_status=0
  docker run --rm --network host \
    -v "$LOAD_DIR/load.js:/load.js:ro" \
    -v "$out:/out" \
    -e BASE_URL -e USERS="$users" -e DURATION -e THINK_MS -e WRITE_SHARE -e WRITE_THINK_MS \
    -e PREFIX -e PASSWORD \
    "$K6_IMAGE" run --summary-export=/out/k6-summary.json /load.js 2>&1 \
    | tee "$out/k6.txt" || k6_status=$?

  kill "$sampler" 2>/dev/null || true
  wait "$sampler" 2>/dev/null || true
  trap - RETURN

  log "logs: app.log, nginx.log"
  sudo incus exec "$NAME" -- journalctl -u guided-reader --since "@$start" --no-pager \
    >"$out/app.log" 2>&1 || true
  sudo incus exec "$NAME" -- journalctl -u nginx --since "@$start" --no-pager \
    >"$out/nginx.log" 2>&1 || true

  {
    echo "when: $(date -Is)"
    echo "commit: $(git -C "$REPO" rev-parse --short HEAD)"
    echo "users: $users"
    echo "duration: $DURATION"
    echo "write_share: $WRITE_SHARE"
    echo "base_url: $BASE_URL"
    echo "k6_exit: $k6_status"
    echo "limits:"
    sudo incus config show "$NAME" 2>/dev/null | grep -E 'limits\.' | sed 's/^/  /'
  } >"$out/meta.txt"

  awk -F, 'NR>1 { if ($5>mem) mem=$5; if ($6>peak) peak=$6; oom=$7; thr=$3 }
    END { printf "  peak_mem_mb=%.1f  peak_mem_peak_mb=%.1f  oom_kills=%d  cpu_throttled_ms=%.0f\n",
      mem/1048576, peak/1048576, oom, thr/1000 }' "$out/resources.csv" \
    | tee -a "$out/meta.txt"

  row="$(summarize "$out/k6-summary.json")"
  echo "RESULT $users	$(printf '%s' "$row")" >"$out/result.tsv"
  echo "$out"
}

USERS_LIST="$USERS"
if [ -n "${SWEEP:-}" ]; then
  USERS_LIST="$SWEEP"
fi

printf '# users\tp95_ms\tp99_ms\terror%%\tchecks%%\n'
for u in $USERS_LIST; do
  out="$(one_run "$u")"
  printf '%s\t%s\n' "$u" "$(cat "$out/result.tsv" | cut -f2-)"
done

log "artefacts under runs/ (latest: $(ls -1dt "$RUNS"/* | head -1))"
