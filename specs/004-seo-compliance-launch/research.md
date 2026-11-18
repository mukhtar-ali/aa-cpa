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
  handles RTL correctly, at `GET /api/og?type=&slug=&lang=` (1200×630 PNG, brand template, cached on disk/S3 by content
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
- **Decision**: Backend: `Redirect` model (`fromPath` unique, `toPath`, `type 301|302`, `hits`, `createdById`) with admin
  CRUD + CSV import (002 area, separate run); Web: `proxy.ts` looks up a cached redirect map (`GET /api/redirects/map`,
  tag `redirects`, revalidated on change) before locale handling.
- **Rationale**: FR-005; legacy URLs from any previous site.

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

## R7. Infrastructure
- **Decision**: Follow `docs/DEPLOY_VPS.md` path B (Docker + GitHub Actions) unless the client already uses Coolify
  (path A); two environments on the same VPS class: `staging.aacpa.sa` and `aacpa.sa`, plus `admin.aacpa.sa` and
  `api.aacpa.sa`. Reverse proxy with automatic TLS (existing compose/Caddy or Coolify Traefik). Images tagged by commit
  SHA; rollback by tag (already documented).
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
