# Go-live checklist (feature 004, T037)

Tick with date and initials. Every unticked box blocks go-live unless the client accepts the risk in writing (record in
`reviews/go-live.md`). Owners: **PM** = project manager, **DEV** = engineering, **CL** = client.

## A. Content and legal (CL/PM)
- [ ] Content audit report shows 100 % approved in Arabic and English, or the client marked specific items Arabic-only (`reviews/content-audit.md`).
- [ ] No placeholder text, lorem, test leads, test articles or "[PLACEHOLDER]" markers; all images licensed (`licenseNote` filled).
- [ ] Estimator prices approved by the client and the draft flag cleared.
- [ ] Privacy policy and terms approved by the client's legal advisor, version `1.0` confirmed; consent version set in `seo-global`.
- [ ] Accessibility statement (ar/en) reviewed and published (`docs/compliance/accessibility-statement.*`).
- [ ] Record of processing reviewed by the client (`docs/compliance/record-of-processing.md`).
- [ ] Footer contacts, offices, phone numbers, licence number 522, social links verified against the client's list.

## B. SEO (DEV)
- [ ] Unique title/description, canonical, hreflang (ar, en, x-default→ar) on every template; staging host is `noindex`, production is not.
- [ ] Rich Results Test passes: Organization/AccountingService, Service, Article, JobPosting, FAQPage, BreadcrumbList (`reviews/seo-validation.md`).
- [ ] OG image renders Arabic correctly (check one page in the Facebook/LinkedIn debugger).
- [ ] `docs/launch/legacy-redirects.csv` has rows (it is header-only until the client gives access to the old site, T004), is client-approved, imported, and `legacy-redirects.spec.ts` passes on staging (all 308 → 200). Do not go live while it is empty.
- [ ] `robots.txt` and `sitemap.xml` correct on production.
- [ ] Search Console properties verified and sitemap submitted (done at cutover).

## C. Privacy, analytics, security (DEV)
- [ ] Consent: no third-party request before consent; category gating, withdrawal and version bump verified (`consent.spec.ts` + manual).
- [ ] GA4 events verified in DebugView: `lead_submitted`, `quote_requested`, `job_applied`, `contact_click`; no personal data in payloads.
- [ ] Admin host sends `Strict-Transport-Security` in production (`ADMIN_HSTS` set in the production env; `curl -sI https://<admin domain>`).
- [ ] Security headers A+ (securityheaders.com), TLS A+ (SSL Labs), CSP enforced after a clean report-only week.
- [ ] `pnpm audit --prod` and Trivy: no high/critical; ZAP baseline: no high; `docs/launch/security-review.md` complete with findings fixed or accepted.
- [ ] No default or seed credentials; secrets rotated from staging values; `.env` files `chmod 600`; Swagger off.

## D. Performance and quality (DEV)
- [ ] Lighthouse mobile ≥ 90 for performance, accessibility, best practices, SEO on every template on **staging** (production re-run after cutover).
- [ ] k6 load test: 500 concurrent, p95 < 1 s cached, 0 errors (`reviews/load-test.md`).
- [ ] axe: 0 serious/critical on all pages; keyboard and screen-reader pass AR/EN (NVDA, VoiceOver).
- [ ] Visual parity with Figma "Page 1" frames signed off by the client (`specs/003-public-site-pages/reviews/parity.md`).

## E. Infrastructure and operations (DEV)
- [ ] Production stack deployed by the pipeline from the release SHA; staging and production use different secrets.
- [ ] Nightly encrypted backup ran at least 3 nights; **restore drill < 60 min** logged (`reviews/restore-drill.md`).
- [ ] **Rollback drill < 15 min** logged (`reviews/rollback-drill.md`).
- [ ] Monitoring live: uptime checks, TLS expiry, disk, outbox, backup age; alert drill < 5 min; alert contacts confirmed (`docs/launch/monitoring.md`).
- [ ] E-mail: SPF/DKIM/DMARC pass, mail-tester ≥ 9/10; existing mailboxes verified; DMARC at `p=none` with reports going to a monitored address (`docs/launch/email-dns.md`).
- [ ] DNS zone export of the old site saved; TTL lowered 48 h before cutover.

## F. People (PM/CL)
- [ ] Staff accounts created with the right roles; training session held and recorded; scripted task test < 30 min.
- [ ] Admin guide (ar/en) delivered.
- [ ] UAT executed and **signed off** by the client (`docs/launch/uat.md`).
- [ ] Support contacts, escalation phone and hypercare schedule agreed; credentials handover list prepared.

## G. Decision
Go / No-go meeting held ____ ; attendees ____ ; decision ____ ; signed (client) ____ ; signed (PM) ____ .
