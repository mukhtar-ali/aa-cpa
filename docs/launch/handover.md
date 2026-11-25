# Handover: credentials, ownership and support (feature 004, T040)

Complete at the end of hypercare. Secrets are **never** written in this file or in e-mail: hand them over through the client's password
manager (shared vault entry per line) and record only *where* each one lives. After handover, rotate anything the delivery team could still see.

## 1. Accounts and who owns them after handover

| Asset | Owner after handover | Where the credential lives | Delivery team access removed (date) |
| --- | --- | --- | --- |
| Domain registrar (`aacpa.sa`) | Client | Client password manager | |
| DNS host | Client | | |
| VPS provider (staging, production) | Client | | |
| GitHub organisation / repository | Client (owner), delivery team (maintainers) | | |
| GitHub environments `staging`, `production`: secrets and required reviewers | Client + delivery team lead | GitHub | |
| GHCR container registry | Client (via GitHub) | | |
| Server SSH key (deploy user) | Delivery team until support ends, then client | | |
| MySQL root and app passwords | Client | server `.env` (mode 600) + vault | |
| `JWT_SECRET`, `CSRF_SECRET` | Client | server `.env` + vault | |
| Admin portal: super admin account | Client | vault; seed password already changed | |
| Staff admin accounts and roles | Client administrator | admin → Users | |
| Backup bucket and **restic password** | Client | vault (losing the restic password = losing all backups) | |
| E-mail provider (SES / Microsoft 365 / Google Workspace) | Client | | |
| Uptime monitoring account and alert contacts | Client | | |
| Google Tag Manager, GA4, Search Console, Bing Webmaster | Client (owner), delivery team (read/edit until support ends) | | |
| Meta pixel (if used) | Client | | |
| Turnstile / CDN account (if used) | Client | | |
| Figma file `1jzfujyx2OJ6EKDRD2X6Xm` | Client | | |

## 2. Rotation checklist (after the delivery team's access is removed)
- [ ] New SSH deploy key installed, old one removed from the VPS and from the GitHub environments.
- [ ] `JWT_SECRET`, `CSRF_SECRET`, database passwords rotated on production (plan a short maintenance window: sessions end).
- [ ] Super admin password changed by the client; no personal accounts of the delivery team remain in admin → Users.
- [ ] GitHub collaborators reviewed; deploy secrets re-entered by the client.
- [ ] Analytics and Search Console: delivery team users removed.
- [ ] Old-site archive and pre-cutover DNS export stored with the client (kept 90 days after go-live: ____).

## 3. Documents handed over
- [ ] `docs/admin-guide/ar.md`, `en.md` (+ PDF export) and the recorded training session.
- [ ] `docs/launch/runbook.md`, `go-live-checklist.md`, `monitoring.md`, `email-dns.md`, `hypercare.md`.
- [ ] `deploy/vps/backup/restore.md` with the last restore-drill result (`reviews/restore-drill.md`).
- [ ] `docs/compliance/record-of-processing.md`, accessibility statements, privacy policy and terms (versions and approval dates).
- [ ] `docs/launch/security-review.md` with findings and risk acceptances; `docs/launch/uat.md` signed.
- [ ] `docs/STATUS.md`: current state, known open items and recommendations.

## 4. Support and escalation
| Level | Contact | Hours | Response target |
| --- | --- | --- | --- |
| Content questions | ⚠ client administrator | working hours | same day |
| Site fault (partial) | ⚠ support owner | ⚠ | 4 working hours |
| Site down / data loss | ⚠ escalation phone | 24/7 during hypercare, then ⚠ | 1 hour |
| Domain, DNS, hosting billing | ⚠ client contact | | |

Support period after launch: ⚠ ______ . Out-of-scope work (new pages, redesign) is quoted separately.

## 5. Sign-off
Handover accepted by (client): ____________  Date: ________  Delivered by: ____________  Date: ________
