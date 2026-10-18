#!/usr/bin/env bash
#
# Exports PG* from the Sun backend's datasource env so the load scripts don't
# carry credentials or a path into the sibling repo themselves.
#
#   source ./pg-env.sh
#
# Any PG* already set wins, so a different target can be pointed at explicitly.

LOAD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(git -C "$LOAD_DIR" rev-parse --show-toplevel)"
SUN_ENV="${SUN_ENV:-$(dirname "$REPO")/Sun/components/sun-graphql/src/main/resources/.env}"

if [ ! -f "$SUN_ENV" ]; then
  echo "pg-env: no backend env at $SUN_ENV (set SUN_ENV or PG* directly)" >&2
  return 1 2>/dev/null || exit 1
fi

URL="$(grep -E '^SPRING_DATASOURCE_URL=' "$SUN_ENV" | cut -d= -f2-)"
export PGHOST="${PGHOST:-$(printf '%s' "$URL" | sed -E 's#^jdbc:postgresql://([^:/]+).*#\1#')}"
export PGPORT="${PGPORT:-$(printf '%s' "$URL" | sed -E 's#^.*:([0-9]+)/.*#\1#')}"
export PGDATABASE="${PGDATABASE:-$(printf '%s' "$URL" | sed -E 's#^.*/([^/]+)$#\1#')}"
export PGUSER="${PGUSER:-$(grep -E '^SPRING_DATASOURCE_USERNAME=' "$SUN_ENV" | cut -d= -f2-)}"
export PGPASSWORD="${PGPASSWORD:-$(grep -E '^SPRING_DATASOURCE_PASSWORD=' "$SUN_ENV" | cut -d= -f2-)}"
