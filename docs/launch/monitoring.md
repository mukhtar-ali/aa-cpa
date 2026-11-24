# Monitoring and alerts (feature 004, T009)

Two layers: an **external** uptime service that sees the site the way a visitor does, and a **host** script for
things only the server knows. Alerts go by email **and** SMS/WhatsApp to the client contact and the support owner.

## 1. External uptime checks (Better Stack or UptimeRobot)

Create the same set for staging and production (staging with a relaxed 5-minute interval and email-only alerts).

| Monitor | URL | Type / expectation | Interval | Alert after |
| --- | --- | --- | --- | --- |
| Web | `https://aacpa.sa/ar` | HTTP 200 and body contains `<html lang="ar"` | 1 min | 2 failures |
| Web health | `https://aacpa.sa/api/health` | 200, JSON `status":"ok"` | 1 min | 2 failures |
| API health | `https://api.aacpa.sa/api/health` | 200 | 1 min | 2 failures |
| Admin | `https://admin.aacpa.sa/` | 200 | 1 min | 2 failures |
| TLS | the four hostnames | certificate expires in < **14 days** | daily | first failure |
| Domain | `aacpa.sa` | expiry < 30 days | daily | first failure |

Web `/api/health` returns the deployed `version` (the image tag), so a monitor on `"version"` also proves which
release is live.

## 2. Host checks (`deploy/vps/monitor/host-checks.sh`)

Installed by the deploy workflow into `~/app/monitor/`; schedule it on the server:

```bash
sudo install -m 755 ~/app/monitor/host-checks.sh /opt/aacpa/host-checks.sh
sudo install -d -m 700 /etc/aacpa
printf 'APP_DIR=/home/deploy/app\nHEARTBEAT_OK_URL=...\nHEARTBEAT_FAIL_URL=...\n' | sudo tee /etc/aacpa/monitor.env
echo '*/5 * * * * deploy /opt/aacpa/host-checks.sh >> /var/log/aacpa-monitor.log 2>&1' | sudo tee /etc/cron.d/aacpa-monitor
```

It alerts on:

| Condition | Threshold | Why |
| --- | --- | --- |
| Disk usage of `/var/lib/docker` | ≥ 80 % (`DISK_LIMIT_PCT`) | uploads, DB and logs share the disk |
| Failed rows in `email_outbox` | any older than 30 min (`OUTBOX_FAILED_MINUTES`) | a lead or applicant notification was not delivered; retry from admin → Settings → Notifications |
| Containers not running/healthy | any | crash loops that the HTTP checks may not show yet |
| Last nightly backup | older than 26 h | backups silently stopped |

The OK heartbeat is a "dead man's switch": if the script or cron stops, the missing ping raises the alert.

## 3. Error-rate spikes

The apps already report errors and web vitals to the in-app monitoring. Configure its alert rule (or the uptime tool's
log/HTTP-status rule) to notify when **5xx responses exceed 2 % over 5 minutes** or any new error group appears
after a release. During hypercare the daily check is logged in `docs/launch/hypercare.md`.

## 4. Alert drill (L6: alert reaches the owner in < 5 min)

Stop the `api` container on staging (`docker compose stop api`), note the time, confirm the email and SMS arrive, start
it again, and record the timing in `specs/004-seo-compliance-launch/reviews/restore-drill.md` under "Alert drill".

## 5. Who gets what

Fill in before go-live (T037): primary contact, backup contact, escalation phone, client contact for downtime notices.
