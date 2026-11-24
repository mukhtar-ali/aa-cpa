# Go-live runbook: aacpa.sa (feature 004, T037)

Roles: **Release owner** (runs the steps), **Client contact** (approves, owns DNS/registrar), **Support owner** (watches
monitoring). Pick a low-traffic window (Sunday morning, Riyadh time). Total hands-on time ≈ 2 h, DNS propagation excluded.
Everything below uses the stack described in `docs/DEPLOY_VPS.md` and `deploy/vps/`; commands run on the production VPS as `deploy` unless noted.

## 0. Preconditions (all must be true, T-7 days)
- [ ] `docs/launch/go-live-checklist.md` sections A–D complete; UAT signed (`docs/launch/uat.md`).
- [ ] Production stack deployed from the release SHA, **empty of test data**, healthy on its temporary address (`healthcheck.sh` passes), reachable by hosts-file override or the VPS IP with `--resolve`.
- [ ] Restore drill and rollback drill logged (`reviews/restore-drill.md`), alert drill passed.
- [ ] Legacy redirect map approved by the client and imported (`docs/launch/legacy-redirects.csv` → admin → Redirects → Import); `legacy-redirects.spec.ts` green on staging.
- [ ] Content audit 100 % approved (`reviews/content-audit.md`), estimator prices approved, draft flag cleared.
- [ ] Zone export of the **old** DNS saved (including MX, SPF, DKIM, verification TXT). Old site static archive stored (kept 90 days).
- [ ] Email DNS ready to add per `docs/launch/email-dns.md`; sender verified on staging.
- [ ] Rollback decision-maker named and reachable during the window.

## 1. T-48 h: lower the TTL
1. At the DNS host, set TTL to **300 s** on `aacpa.sa`, `www`, `admin`, `api` (A/AAAA/CNAME only; do not touch MX/TXT).
2. Note the old values: web A = ____, www = ____.
3. Confirm with `dig +noall +answer aacpa.sa` that the TTL shown is ≤ 300 after the old TTL has elapsed.

## 2. T-1 h: freeze and final checks
1. Announce a content freeze on the old site (client).
2. `docker compose ps` all healthy; `docker compose logs --tail=200 api web | grep -i error` shows nothing new.
3. Take a manual backup: `sudo systemctl start aacpa-backup.service`, then `restic snapshots --tag production` shows a fresh snapshot.
4. Certificate pre-check: Caddy can only obtain TLS once DNS points here. To avoid a gap, pre-issue via DNS-01 or accept the first-request delay of ≤ 1 min (step 4 verifies).
5. Production env flags: `APP_ENV=production`, `WEB_ROBOTS_TAG="index, follow"`, `MAINTENANCE_MODE` unset.

## 3. Cutover
1. Switch records (release owner, with the client contact watching):
   - `aacpa.sa` A (and AAAA if used) → production VPS IP.
   - `www.aacpa.sa` CNAME → `aacpa.sa` (or A → same IP). Caddy redirects www → apex (step 5).
   - `admin.aacpa.sa`, `api.aacpa.sa` A → VPS IP.
   - **Do not change MX, SPF-for-existing-mail, existing DKIM or any verification TXT.** Merge new SPF/DKIM records only as written in `email-dns.md`.
2. Start the clock: `date -Is` → cutover time ____.
3. Watch propagation: `dig +short aacpa.sa @1.1.1.1`, `@8.8.8.8`, and the client's resolver until all return the new IP.

## 4. TLS and routing verification (within 15 min of propagation)
- [ ] `curl -sI https://aacpa.sa/ar | head` → `200`, valid certificate, `strict-transport-security`, **no** `x-robots-tag: noindex`.
- [ ] `curl -sI https://www.aacpa.sa/` → `308` to `https://aacpa.sa/`.
- [ ] `curl -sI http://aacpa.sa/` → redirect to https.
- [ ] `https://admin.aacpa.sa` shows the login page; `https://api.aacpa.sa/api/health` → 200; `/api/docs` (Swagger) not served.
- [ ] `https://aacpa.sa/robots.txt` allows `/` and lists the sitemap; `/sitemap.xml` lists ar + en URLs with the production host.
- [ ] `WEB_DOMAIN=aacpa.sa ADMIN_DOMAIN=admin.aacpa.sa API_DOMAIN=api.aacpa.sa deploy/vps/healthcheck.sh <sha>` passes.

## 5. Smoke tests (release owner + client, ~30 min)
- [ ] Home, About, Services (list + one detail), Sectors, Articles (list + detail), Careers (list + detail), Contact, Privacy, Terms, Accessibility load in **ar and en**; language switch keeps the path.
- [ ] Contact form: submit a test lead → appears in admin Leads within 1 min; notification e-mail arrives at the configured recipients (check SPF/DKIM/DMARC `pass` in the headers); delete the test lead afterwards.
- [ ] Job application with a small PDF → visible in admin; CV downloads for an authorised user only.
- [ ] Estimator completes and shows approved prices.
- [ ] Consent: fresh private window shows the banner; no requests to Google/Meta before consent; accept → GA4 Realtime shows the visit (DebugView with the GTM preview).
- [ ] Legacy URLs: run `pnpm exec playwright test e2e/specs/seo/legacy-redirects.spec.ts` with `BASE_URL=https://aacpa.sa` → all 308 → 200.
- [ ] Existing mail still works: send and receive between two client mailboxes and an external address.
- [ ] Admin: log in with the client's real account; seed/default passwords removed.

## 6. Search and analytics setup
1. **Search Console**: add/verify the domain property `aacpa.sa` (DNS TXT) and the URL-prefix property `https://aacpa.sa/`; submit `https://aacpa.sa/sitemap.xml`; inspect the home page in both languages (URL Inspection → Request indexing).
2. If the old site had a Search Console property, use **Change of Address** only if the domain changed (it did not): keep the property and just re-submit the sitemap.
3. **GA4/GTM**: publish the GTM container version documented in `docs/launch/analytics.md`; verify `lead_submitted` in DebugView; mark conversions.
4. Bing Webmaster Tools: import from Search Console (optional).
5. Rich Results Test on the home page, one service, one article, one job; record in `reviews/seo-validation.md`.

## 7. Announce and record
- [ ] Client contact confirms go-live in writing; support owner confirms monitors are green.
- [ ] Record times, issues and decisions in `specs/004-seo-compliance-launch/reviews/go-live.md`.
- [ ] Raise the DNS TTL back to the normal value (e.g. 3600 s) after 24 h of stability.
- [ ] Hypercare starts: `docs/launch/hypercare.md`.

## Rollback (decide by T+60 min; the criteria are objective)
Roll back if **any** of: site not serving valid HTTPS 30 min after propagation, contact form or admin login broken with no quick fix, data loss, or error rate > 5 % for 10 min.

1. **Application fault, DNS fine**: redeploy the previous good tag: GitHub → Actions → *Deploy to VPS* → Run workflow → environment `production`, `rollback_tag` = last good SHA (≈ 5 min). Verify with `healthcheck.sh`.
2. **Platform fault, need the old site**: restore the old A records noted in step 1.2 (TTL 300 s so ≈ 5–10 min). The old site stays untouched and running until hypercare ends. Mail is unaffected because MX never changed.
3. **Data fault**: follow `deploy/vps/backup/restore.md` on the same VPS.
4. Announce the rollback to the client, write the cause in `reviews/go-live.md`, and reschedule only after a fix is verified on staging.

## After go-live
- HSTS `preload` and DMARC `p=quarantine` are **not** done on day one; see `hypercare.md` for when.
- Old-site archive and the pre-cutover zone export stay for 90 days.
