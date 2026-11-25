#!/usr/bin/env bash
# One-time setup on the VPS (as root): installs restic, the script, and the nightly timer.
#   sudo ./install.sh        then edit /etc/aacpa/backup.env and run: systemctl start aacpa-backup.service
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
if ! command -v restic >/dev/null; then apt-get update -y && apt-get install -y restic; fi
install -d -m 755 /opt/aacpa
install -m 755 "$here/restic-backup.sh" /opt/aacpa/restic-backup.sh
install -m 644 "$here/aacpa-backup.service" "$here/aacpa-backup.timer" /etc/systemd/system/
install -d -m 700 /etc/aacpa
[ -f /etc/aacpa/backup.env ] || install -m 600 "$here/backup.env.example" /etc/aacpa/backup.env
systemctl daemon-reload
systemctl enable --now aacpa-backup.timer
echo "Edit /etc/aacpa/backup.env, then: systemctl start aacpa-backup.service && journalctl -u aacpa-backup -n 50"
