#!/usr/bin/env bash
#
# Samples the cassini cgroup into a CSV: CPU time, CPU throttling, memory and
# OOM kills. Reads the host-side cgroup so it reports the container's caps, not
# the app's own accounting.
#
#   ./sample.sh <csv-path> [interval-seconds]

set -euo pipefail

OUT="$1"
INTERVAL="${2:-1}"
NAME="${NAME:-cassini}"
CG="/sys/fs/cgroup/lxc.payload.$NAME"

if [ ! -d "$CG" ]; then
  echo "sample: no cgroup at $CG (is $NAME running?)" >&2
  exit 1
fi

echo "epoch,cpu_usec,throttled_usec,nr_throttled,mem_current,mem_peak,oom_kills" >"$OUT"

while :; do
  read -r usage throttle <<<"$(awk '/^usage_usec/{u=$2} /^throttled_usec/{t=$2} END{print u+0, t+0}' "$CG/cpu.stat")"
  nthrottled="$(awk '/^nr_throttled/{print $2}' "$CG/cpu.stat")"
  mem="$(cat "$CG/memory.current" 2>/dev/null || echo 0)"
  peak="$(cat "$CG/memory.peak" 2>/dev/null || echo 0)"
  oom="$(awk '/^oom_kill /{print $2}' "$CG/memory.events" 2>/dev/null || echo 0)"
  printf '%s,%s,%s,%s,%s,%s,%s\n' \
    "$(date +%s.%N)" "$usage" "$throttle" "$nthrottled" "$mem" "$peak" "$oom" >>"$OUT"
  sleep "$INTERVAL"
done
