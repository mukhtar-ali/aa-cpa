#!/usr/bin/env bash
# Health gate used by the deploy workflow and by hand: exits non-zero unless web, admin and API answer 200.
#   WEB_DOMAIN=aacpa.sa ADMIN_DOMAIN=admin.aacpa.sa API_DOMAIN=api.aacpa.sa ./healthcheck.sh [expected-sha]
# With an expected SHA the web /api/health `version` must match, which proves the new image is the one serving.
set -euo pipefail
: "${WEB_DOMAIN:?}" "${ADMIN_DOMAIN:?}" "${API_DOMAIN:?}"
expected="${1:-}"
attempts="${HEALTH_ATTEMPTS:-30}"
delay="${HEALTH_DELAY:-10}"

check() {
  local url="$1" i
  for i in $(seq 1 "$attempts"); do
    if curl -fsS --max-time 10 "$url" -o /tmp/health.body; then return 0; fi
    sleep "$delay"
  done
  echo "UNHEALTHY: $url" >&2
  return 1
}

check "https://${API_DOMAIN}/api/health"
check "https://${WEB_DOMAIN}/api/health"
if [ -n "$expected" ] && ! grep -q "\"version\":\"${expected}" /tmp/health.body; then
  echo "Web is healthy but not serving ${expected}: $(cat /tmp/health.body)" >&2
  exit 1
fi
check "https://${ADMIN_DOMAIN}/"
echo "All healthy${expected:+ at ${expected}}"
