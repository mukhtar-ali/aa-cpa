# Hypercare log: 14 days after go-live (feature 004, T039)

Daily check by the support owner (≈ 20 min). One row per day; any red item gets a ticket the same day.

| Day | Date | Uptime (24 h) | 5xx / errors | New error groups | Failed outbox rows | Leads received vs delivered | CWV (LCP/CLS, mobile) | Search Console coverage | Backup ran | Notes / action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | | | | | | |
| 2 | | | | | | | | | | |
| 3 | | | | | | | | | | |
| 4 | | | | | | | | | | |
| 5 | | | | | | | | | | |
| 6 | | | | | | | | | | |
| 7 | | | | | | | | | | |
| 8 | | | | | | | | | | |
| 9 | | | | | | | | | | |
| 10 | | | | | | | | | | |
| 11 | | | | | | | | | | |
| 12 | | | | | | | | | | |
| 13 | | | | | | | | | | |
| 14 | | | | | | | | | | |

## What to check
- **Uptime and errors**: uptime tool report; in-app monitoring for 5xx and new error groups since the last release.
- **Leads delivered**: admin leads count vs notification e-mails received by the client; failed outbox rows = 0 (`docs/launch/monitoring.md`).
- **Core Web Vitals**: Search Console → Core Web Vitals and the in-app web-vitals dashboard; investigate any template with LCP > 2.5 s or CLS > 0.1.
- **Search Console**: sitemap status "Success", discovered vs indexed pages rising, no spike in "Not found (404)" (add missing legacy redirects), no manual actions.
- **Redirect hits**: admin → Redirects, sort by hits; confirm the legacy URLs are being used and fix any that 404.
- **Backups**: last snapshot < 26 h old.

## Exit criteria (end of day 14)
- [ ] Zero critical incidents; all red items closed or accepted.
- [ ] Client confirms leads are arriving and being handled.
- [ ] Stable period reached, so now:
  - [ ] Enable HSTS **preload** (submit `aacpa.sa` at hstspreload.org only after 30 days of clean HTTPS on all subdomains).
  - [ ] Move DMARC from `p=none` to `p=quarantine` after reviewing 2 weeks of aggregate reports (`docs/launch/email-dns.md`).
  - [ ] Raise DNS TTLs; decommission the old site after its 90-day archive window.
  - [ ] Hand over: `docs/STATUS.md` updated, credentials handover checklist signed (T040).
