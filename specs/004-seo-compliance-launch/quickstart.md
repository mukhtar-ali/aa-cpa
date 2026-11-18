# Quickstart & Validation: SEO, Analytics, Compliance & Launch

- **L1 SEO** — every template: unique title/description, canonical, hreflang (ar, en, x-default→ar), OG image renders
  Arabic correctly; Rich Results Test passes for Organization/AccountingService, Service, Article, JobPosting, FAQPage,
  BreadcrumbList; sitemap lists all published URLs in both languages; staging returns `noindex` + robots disallow.
- **L2 Consent** — fresh profile: no requests to Google/Meta domains before consent (Playwright network log); accept
  analytics only → GA requests, no pixel; withdraw from footer → stops; version bump → banner returns; banner keyboard and
  screen-reader usable in AR/EN.
- **L3 Events** — test journeys produce exactly one `lead_submitted`, `quote_requested`, `job_applied`, `contact_click`
  each in GA4 DebugView and in the admin dashboard; no personal data in payloads.
- **L4 Security** — securityheaders.com A+, SSL Labs A+; CSP no violations on all templates (report-only week clean);
  `pnpm audit` and Trivy: no high/critical; ZAP baseline no high; manual checklist complete.
- **L5 Performance** — Lighthouse mobile ≥ 90 ×4 on production per template; k6 500 VUs, p95 < 1 s on cached pages,
  0 errors.
- **L6 Ops** — deploy to staging and prod from CI; rollback drill < 15 min; uptime alert drill < 5 min; restore drill
  < 1 h from yesterday's off-site backup; SPF/DKIM/DMARC pass (mail-tester ≥ 9/10).
- **L7 Content & people** — content audit report: 100% approved (or client-marked Arabic-only); estimator approved;
  admin guide delivered; staff task script < 30 min; UAT signed.
- **L8 Go-live** — runbook executed; Search Console (both properties) verified, sitemap submitted; legacy redirects
  verified; hypercare log for 14 days with zero critical incidents.
