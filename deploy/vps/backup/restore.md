# Restore runbook (backups: `restic-backup.sh`)

Target: a fresh VPS back in service in **under 1 hour** (SC-005). Rehearse it before launch (task T011) and log the
timings in `specs/004-seo-compliance-launch/reviews/restore-drill.md`.

You need: the restic repository URL, `RESTIC_PASSWORD`, the bucket credentials, the stack's `.env` (kept in the client's
password manager, it is **not** in the backup), DNS control for the stack's hostnames.

## 1. Prepare the server (about 10 min)
1. Ubuntu LTS VPS, install Docker + Compose plugin, create user `deploy`, open ports 80/443/22.
2. `apt-get install -y restic`
3. As `deploy`: `mkdir -p ~/app && cd ~/app`, place `.env` (from `env.prod.example`, filled) and the compose files.
   If CI is available, run the deploy workflow instead; it copies `docker-compose.yml` and `Caddyfile` and starts empty
   containers (continue at step 3 once `mysql` is healthy).
4. Point DNS A records at the new VPS (lower TTL beforehand if this is a real incident).

## 2. Fetch the backup (about 5 min)
```bash
export RESTIC_REPOSITORY=s3:https://s3.me-central-1.amazonaws.com/<bucket>/production
export RESTIC_PASSWORD=...  AWS_ACCESS_KEY_ID=...  AWS_SECRET_ACCESS_KEY=...
restic snapshots --tag production            # pick the newest (or the one before an incident)
restic restore latest --tag production --target /var/tmp/restore
ls /var/tmp/restore/var/tmp/aacpa-backup.*/  # db.sql.gz and uploads.tar
```

## 3. Restore the database (about 10 min)
```bash
cd ~/app
docker compose up -d mysql && docker compose ps       # wait for "healthy"
DUMP=$(ls /var/tmp/restore/var/tmp/aacpa-backup.*/db.sql.gz)
gunzip -c "$DUMP" | docker compose exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
```

## 4. Restore uploads (skip if the stack uses S3)
```bash
UP=$(ls /var/tmp/restore/var/tmp/aacpa-backup.*/uploads.tar)
docker compose up -d api
docker compose exec -T api sh -c 'tar -C /app/apps/api/storage -xf -' < "$UP"
```

## 5. Start and verify (about 10 min)
```bash
docker compose up -d
WEB_DOMAIN=... ADMIN_DOMAIN=... API_DOMAIN=... ./healthcheck.sh   # from the repo's deploy/vps
```
Then: log in to the admin, open the latest lead and article, load an uploaded image, check the outbox page for
`failed` rows. Remove `/var/tmp/restore` (it holds personal data).

## 6. After the drill / incident
Record: snapshot id and age, minutes per step, anything missing from this runbook (fix the runbook), and re-run
`systemctl start aacpa-backup` on the new server to confirm backups resume.
