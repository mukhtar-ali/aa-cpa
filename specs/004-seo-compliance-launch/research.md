# Research: SEO, Analytics, Compliance & Launch

**Feature**: `004-seo-compliance-launch` | **Date**: 2026-11-18

## R1. Metadata & structured data
- **Decision**: Extend 003's `buildMetadata` (Next Metadata API) with OG/Twitter images and JSON-LD. JSON-LD rendered by a
  server component `JsonLd` (`<script type="application/ld+json">`, escaped) per page: `AccountingService` +
  `Organization` (home, about, contact) with `hasCredential` (SOCPA licence 522), `memberOf` (3E Accounting),
  `department`/`location` for the three offices (Riyadh HQ, Al-Khobar, Al-Qassim) with `PostalAddress`, `telephone`,
  `openingHoursSpecification`; `Service` (service details); `Article` (articles); `JobPosting` (jobs, with
  `validThrough` = `closesAt`, `hiringOrganization`, `jobLocation`, `employmentType`); `FAQPage` (service/contact FAQ);
  `BreadcrumbList` (all inner pages). Localized via `inLanguage`.
- **Rationale**: FR-002; Google supports all these types; data already in 002.

## R2. Social images with Arabic text
- **Decision**: Generate OG images in the API with sharp + SVG/Pango text (`apps/api/src/og/`), which shapes Arabic and
  handles RTL correctly, at `GET /api/og?type=&key=&lang=` (1200×630 PNG, brand template, cached on disk/S3 by content
  hash). Next `openGraph.images` points to it when no custom image is set.
- **Rationale**: `next/og` (Satori) has incomplete Arabic shaping/bidi support; sharp/libvips with Pango renders it
  properly and already ships in the API.
- **Alternatives**: Static per-page images (manual work), headless browser screenshots (heavy).

## R3. Sitemap & robots
- **Decision**: `app/sitemap.ts` generates entries for both languages with `alternates.languages`, `lastModified` from
  `updatedAt`; split into sitemap index if > 1,000 URLs (not expected). `app/robots.ts`: production allows all except
  `/api/`, `/*/reference/`, preview; non-production (`APP_ENV != production`) disallows all and pages emit
  `noindex`. Admin and API Swagger send `X-Robots-Tag: noindex`.

## R4. Redirect manager
- **Decision**: Backend: `Redirect` model (`fromPath` unique, `toPath`, `type permanent|temporary` served as 308|307, `hits`,
  `createdById`) with admin CRUD + CSV import (002 area, separate run); 002 `SlugRedirect` rows are migrated into it, slug
  changes write `Redirect` rows from then on, and `SlugRedirect` is dropped; Web: `proxy.ts` looks up a cached redirect map (`GET /api/redirects/map`,
  tag `redirects`, revalidated on change) before locale handling.
- **Rationale**: FR-005; legacy URLs from any previous site.

## R4b. Legacy site migration (client has an existing site)
- **Decision**: Before cutover: crawl the old site (Screaming Frog or `wget --spider` script `tests/legacy/crawl.sh`),
  merge with the old sitemap and Search Console / analytics top pages and backlinks; map each URL to a new path in
  `docs/launch/legacy-redirects.csv` (client reviews); import via the redirect manager; Playwright check that every
  legacy URL returns 301 → 200. Record the old site's DNS (incl. MX, SPF, DKIM, verification TXT records) so cutover
  changes only the web records; keep a static archive of the old site for 90 days.

## R5. Consent & analytics
- **Decision**: Own lightweight consent manager (no third-party CMP): DS components `ConsentBanner` and
  `ConsentPreferences` (dialog) + `useConsent()` storing `{ version, categories, at }` in a first-party cookie
  `aacpa_consent` (12 months). Google Consent Mode v2 defaults (`denied`) are set inline before GTM; GTM/GA4/Meta Pixel
  (existing `seo-global` settings `gtmId`, `gaId`, pixel) load only after the matching category is granted; consent
  version bump re-prompts. `track()` (003) forwards to `dataLayer` when analytics consent is granted.
- **Rationale**: PDPL-aligned, bilingual, matches design system; avoids CMP fees and layout mismatch.
- **Alternatives**: Cookiebot/OneTrust (cost, styling limits, Arabic quality).

## R6. Security headers & CSP
- **Decision**: Web: CSP with per-request nonce from `proxy.ts` (`script-src 'self' 'nonce-…' https://www.googletagmanager.com
  https://challenges.cloudflare.com`; `img-src` self, API/S3 hosts, data:, Google; `frame-src` Turnstile, Google Maps if
  used; `connect-src` API, GA endpoints), HSTS (preload after 30 days stable), `X-Content-Type-Options`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy` minimal, `frame-ancestors 'none'`. API keeps
  `security-headers.middleware.ts`. Report-only CSP on staging for one week first.
- **Implementation note (T025)**: per-request nonce + `'strict-dynamic'` as decided (no `unsafe-inline` for scripts; styles stay inline-capable).
  The layout reads the nonce from `headers()` (set by `proxy.ts`), which keeps every route per-request, as 003 already renders. `CSP_MODE=report-only`
  (default) or `enforce`; HSTS and `upgrade-insecure-requests` only when `APP_ENV=production`.

## R7. Infrastructure
- **Decision** (confirmed 2026-11-18): `docs/DEPLOY_VPS.md` path B — Docker Compose on a VPS, deployed by GitHub
  Actions over SSH; Caddy as reverse proxy with automatic TLS. Two environments on the same VPS class: `staging.aacpa.sa` and `aacpa.sa`, plus `admin.aacpa.sa` and
  `api.aacpa.sa`. Images built in CI, pushed to GHCR, tagged by commit SHA; rollback by tag (already documented).
  Staging and production run as separate Compose projects (separate VPS recommended for production isolation; same VPS
  acceptable if the client limits cost).
- **CDN (optional, client cost)**: Cloudflare free/pro in front of web and API (DNS proxied), caching static assets;
  disable for `/api/` writes.

## R8. Backups & restore
- **Decision**: Nightly `mysqldump --single-transaction` + uploads sync, encrypted and pushed off-site with `restic` to
  S3-compatible storage (client's AWS or Backblaze B2), retention 30 daily / 12 monthly; restore runbook rehearsed on a
  fresh VPS before launch (SC-005).

## R9. Monitoring & alerting
- **Decision**: External uptime checks (Better Stack or UptimeRobot) on web, admin, API `/api/health` every 1 min with
  email + WhatsApp/SMS alerts; existing in-app monitoring for errors/web vitals; alerts for failed-email outbox count > 0
  for 30 min, disk > 80 %, certificate < 14 days (from the uptime tool).

## R10. Email domain
- **Decision**: Transactional mail through a reputable SMTP provider (Amazon SES me-central-1 or the client's Microsoft
  365/Google Workspace SMTP relay) configured in the existing `email-settings`; SPF include, DKIM CNAMEs, DMARC `p=none`
  → `quarantine` after 2 weeks of clean reports. Must not disturb the client's existing MX.

## R11. Quality & security testing
- **Decision**: CI adds `pnpm audit --prod --audit-level high` and Trivy image scan; OWASP ZAP baseline scan against
  staging; manual review checklist (forms, uploads, auth, admin RBAC, IDOR on leads/applications, CSV injection in
  exports); k6 load test scripts in `tests/load/`.

## R12. Content & training
- **Decision**: Content audit is a generated report: `pnpm --filter @repo/api content:audit` lists every section and
  entity with ar/en completeness, missing alt text, placeholder markers (`[PLACEHOLDER]`, lorem, "شعار الجهة"),
  draft estimator, unlicensed image flags (admin `licenseNote` field on images). Admin guide as Markdown → PDF in AR/EN
  in `docs/admin-guide/`.

## R10. Decisions recorded after the coverage analysis (2026-11-24)

- **Queue (FR-043):** the 002 outbox stays; Redis/BullMQ is not adopted. `deploy/vps/monitor/host-checks.sh` alerts on pending and failed outbox rows.
- **Maps (FR-030):** the contact page has no map embed, so the CSP carries no map origin. If a map is added later, add its origin to `frame-src` and a test in `security-headers.test.ts`.
- **Two different versions:** the *consent* version (`seo-global.consentVersion`) invalidates the stored cookie banner choice; the *policy* version (T003, `1.0`) is recorded on every form-consent record. They are independent. Today one CMS field feeds the cookie version only.
- **robots (FR-003):** admin and API are kept out of search by the `X-Robots-Tag: noindex, nofollow` header in the Caddyfile (robots.txt only lists the paths of the public host).
- **Admin HSTS (FR-030):** sent by Caddy through `ADMIN_HSTS` (production only); the web app and the API send their own.
- **Event properties (US3):** `page` and URL come from GTM's built-in `page_location`; `service_id`, `lang` and the other properties ride on the event itself. `contact_click` and `quote_requested` carry no `page` field on purpose.
- **Lighthouse / CDN (SC-004):** budgets live in `lighthouserc.json`; a CDN is optional and is decided with T001.
- **Uploads backup (FR-041):** `restic-backup.sh` archives the `api_uploads` volume. With S3 storage that archive is empty, so enable bucket versioning or replication instead.
