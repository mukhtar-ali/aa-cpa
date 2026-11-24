#!/usr/bin/env bash
# Host-side checks an external uptime tool cannot see (feature 004, T009). Run every 5 minutes from cron/systemd.
# Each failing check pings HEARTBEAT_FAIL_URL (an UptimeRobot/Better Stack "heartbeat"/"incoming webhook" that alerts by
# email + SMS/WhatsApp); a healthy run pings HEARTBEAT_OK_URL so a dead cron is also noticed (missed heartbeat).
#
#   */5 * * * * deploy /opt/aacpa/host-checks.sh        config: /etc/aacpa/monitor.env
#   APP_DIR, DISK_LIMIT_PCT (80), OUTBOX_FAILED_MINUTES (30), HEARTBEAT_OK_URL, HEARTBEAT_FAIL_URL
set -uo pipefail
# shellcheck disable=SC1091
[ -f /etc/aacpa/monitor.env ] && { set -a; . /etc/aacpa/monitor.env; set +a; }
: "${APP_DIR:?}"
problems=()

# 1. Disk usage of the filesystem holding Docker volumes and backups
pct="$(df --output=pcent /var/lib/docker 2>/dev/null | tail -n1 | tr -dc '0-9')"
[ -n "$pct" ] && [ "$pct" -ge "${DISK_LIMIT_PCT:-80}" ] && problems+=("disk ${pct}% used")

# 2. Failed outbox rows older than N minutes (emails to leads/applicants or cache revalidations that never went out)
minutes="${OUTBOX_FAILED_MINUTES:-30}"
failed="$(cd "$APP_DIR" && docker compose exec -T mysql sh -c \
  "mysql -N -uroot -p\"\$MYSQL_ROOT_PASSWORD\" \"\$MYSQL_DATABASE\" -e \"SELECT COUNT(*) FROM email_outbox WHERE status='failed' AND updatedAt < NOW() - INTERVAL ${minutes} MINUTE\"" 2>/dev/null | tr -dc '0-9')"
if [ -z "$failed" ]; then problems+=("could not query the outbox");
elif [ "$failed" -gt 0 ]; then problems+=("${failed} failed outbox rows older than ${minutes} min"); fi

# 3. Containers that are not running/healthy
bad="$(cd "$APP_DIR" && docker compose ps --format '{{.Service}}={{.State}}/{{.Health}}' | grep -v -E '=running/(healthy)?$' || true)"
[ -n "$bad" ] && problems+=("containers: $(echo "$bad" | tr '\n' ' ')")

# 4. Last nightly backup finished within 26 h
if systemctl list-unit-files aacpa-backup.service >/dev/null 2>&1; then
  ts="$(systemctl show aacpa-backup.service -p ExecMainExitTimestamp --value 2>/dev/null)"
  if [ -z "$ts" ]; then problems+=("backup has never run"); else
    age=$(( $(date +%s) - $(date -d "$ts" +%s 2>/dev/null || echo 0) ))
    [ "$age" -gt 93600 ] && problems+=("last backup is $((age/3600)) h old")
  fi
fi

if [ "${#problems[@]}" -gt 0 ]; then
  msg="$(IFS='; '; echo "${problems[*]}")"
  echo "[$(date -Is)] PROBLEM: $msg" >&2
  [ -n "${HEARTBEAT_FAIL_URL:-}" ] && curl -fsS --max-time 10 --get --data-urlencode "msg=${msg}" "$HEARTBEAT_FAIL_URL" >/dev/null || true
  exit 1
fi
[ -n "${HEARTBEAT_OK_URL:-}" ] && curl -fsS --max-time 10 "$HEARTBEAT_OK_URL" >/dev/null || true
echo "[$(date -Is)] ok"
