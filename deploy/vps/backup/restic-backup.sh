#!/usr/bin/env bash
# Nightly encrypted off-site backup (feature 004, T008): MySQL dump + uploads volume -> restic repository.
# Runs on the VPS host (systemd timer, see aacpa-backup.timer). Restore: restore.md.
#
# Config lives in /etc/aacpa/backup.env (chmod 600, never in git):
#   RESTIC_REPOSITORY=s3:https://s3.me-central-1.amazonaws.com/<bucket>/<env>   (or b2:<bucket>:<env>)
#   RESTIC_PASSWORD=<long random; also stored in the client's password manager, losing it = losing every backup>
#   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (or B2_ACCOUNT_ID / B2_ACCOUNT_KEY)
#   APP_DIR=/home/deploy/app            # folder holding docker-compose.yml and .env
#   BACKUP_ENV=production               # production | staging, used in tags and the heartbeat
#   HEARTBEAT_URL=https://...           # optional: pinged on success (Better Stack / UptimeRobot heartbeat)
#   KEEP_DAILY=30 KEEP_MONTHLY=12       # optional overrides
set -euo pipefail

ENV_FILE="${BACKUP_ENV_FILE:-/etc/aacpa/backup.env}"
# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a
: "${RESTIC_REPOSITORY:?}" "${RESTIC_PASSWORD:?}" "${APP_DIR:?}" "${BACKUP_ENV:?}"

STAGE="$(mktemp -d /var/tmp/aacpa-backup.XXXXXX)"
trap 'rm -rf "$STAGE"' EXIT
cd "$APP_DIR"
dc() { docker compose "$@"; }

echo "[$(date -Is)] dumping database"
# --single-transaction = consistent snapshot without locking the site; the password is read inside the container.
dc exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers --no-tablespaces "$MYSQL_DATABASE"' \
  | gzip -9 > "$STAGE/db.sql.gz"
# A truncated dump must never be uploaded as if it were good.
test "$(gzip -dc "$STAGE/db.sql.gz" | tail -n 1 | grep -c 'Dump completed')" -eq 1 || { echo "dump looks incomplete" >&2; exit 1; }

echo "[$(date -Is)] archiving uploads"
# The API stores uploads in the api_uploads volume when S3 is not configured. Empty archive is fine if S3 is used.
dc exec -T api sh -c 'tar -C /app/apps/api/storage -cf - .' > "$STAGE/uploads.tar" 2>/dev/null || : > "$STAGE/uploads.tar"

restic snapshots >/dev/null 2>&1 || restic init
echo "[$(date -Is)] uploading"
restic backup "$STAGE" --tag "$BACKUP_ENV" --host "aacpa-$BACKUP_ENV" --tag nightly
echo "[$(date -Is)] pruning"
restic forget --tag "$BACKUP_ENV" --group-by host,tags \
  --keep-daily "${KEEP_DAILY:-30}" --keep-monthly "${KEEP_MONTHLY:-12}" --prune
# Weekly integrity check (reads 5% of the data) so silent corruption is found before a restore needs it.
if [ "$(date +%u)" = "7" ]; then restic check --read-data-subset=5%; fi

[ -n "${HEARTBEAT_URL:-}" ] && curl -fsS --max-time 10 --retry 3 "$HEARTBEAT_URL" >/dev/null || true
echo "[$(date -Is)] backup finished"
