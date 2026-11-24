---
description: "Task list for 004-seo-compliance-launch (code/IaC by agy; client/PM items marked [CLIENT]; reviewed by Claude)"
---

# Tasks: SEO, Analytics, Compliance & Production Launch

**Tests**: REQUIRED for code tasks. `[CLIENT]` = needs the client or project manager (not delegated to agy).

## Phase 1: Setup & client inputs (start immediately, in parallel with 001–003)

- [ ] T001 [CLIENT] Confirm domain `aacpa.sa` DNS access, VPS provisioning (staging + production; hosting decided: Docker + GitHub Actions), budget for backups bucket, uptime tool, optional CDN
- [ ] T002 [CLIENT] Provide/approve analytics accounts (GA4 property, GTM container, Meta pixel if any) and Search Console access
- [ ] T003 [CLIENT] Legal advisor drafts/approves privacy policy and terms (we supply drafts from Figma copy); confirm policy version `1.0`
- [ ] T004 [CLIENT] Give access to the existing website, its Search Console/analytics, and current DNS zone export (incl. MX/SPF/DKIM); choose transactional email provider and sender addresses
- [X] T004a Legacy URL inventory per research R4b: crawl script `tests/legacy/crawl.sh`, merge sources, mapping `docs/launch/legacy-redirects.csv` for client review
- [X] T004b Playwright `e2e/specs/seo/legacy-redirects.spec.ts` reading the CSV: every legacy URL → 308 → 200 on staging and production
- [ ] T005 [CLIENT] Licensed photos, team portraits, client-logo permissions, credential logos; staff list with roles

## Phase 2: User Story 4 — Infrastructure (P1) (needed for staging of 003)

- [X] T006 Create `deploy/vps/docker-compose.prod.yml` (web, api, admin, mysql, reverse proxy with auto TLS) for `staging` and `prod` stacks; env templates `deploy/vps/env.{staging,prod}.example`
- [X] T007 Extend `.github/workflows/deploy-vps.yml` with GitHub environments `staging` (auto on main) and `production` (manual approval), SHA tags, health-check gate, rollback job
- [X] T008 [P] Backups: `deploy/vps/backup/restic-backup.sh` (mysqldump + uploads, encrypted, off-site, retention) + systemd timer/cron + `deploy/vps/backup/restore.md`
- [X] T009 [P] Monitoring: uptime checks for web, admin, API `/api/health` and web `/api/health` (documented in `docs/launch/monitoring.md`); alerts for error-rate spikes, failed outbox > 0 for 30 min, disk > 80 %, TLS certificate < 14 days
- [X] T010 [P] Email authentication runbook `docs/launch/email-dns.md` (SPF/DKIM/DMARC records for chosen provider) and configure staging sender
- [ ] T011 Restore drill on a fresh VPS; record timing in `specs/004-seo-compliance-launch/reviews/restore-drill.md`
- [ ] T011a Rollback drill on staging (deploy a deliberately broken build, roll back by SHA tag) in < 15 min; record in `reviews/rollback-drill.md`

## Phase 3: User Story 1 — SEO (P1)

- [X] T012 [P] [US1] Tests then JSON-LD builders `apps/web/src/lib/seo/json-ld/{organization,service,article,job-posting,faq,breadcrumb}.ts` + `apps/web/src/components/JsonLd.tsx`
- [X] T013 [US1] Extend `buildMetadata` (OG/Twitter images, `noindex` outside production, alternates) and wire JSON-LD into all 12 pages
- [X] T014 [P] [US1] API OG renderer `apps/api/src/og/` (sharp + Pango SVG brand template, AR/EN, cache by hash) with tests; shared endpoint + schema in `packages/shared`
- [X] T015 [US1] Complete `apps/web/app/sitemap.ts` (both languages, alternates, lastModified) and `robots.ts` per env
- [X] T016 [P] [US1] Backend redirect manager: `Redirect` model + migration (migrate 002 `SlugRedirect` rows, switch slug-change writes, drop `SlugRedirect`), admin CRUD + CSV import (loop/chain checks), `GET /api/redirects/map` (API/admin run) with unit + e2e tests
- [X] T017 [US1] Web redirect handling in `apps/web/proxy.ts` using cached map, with tests
- [X] T018 [US1] Admin SEO fields: per-page and per-item OG image + preview of search snippet (`apps/admin/src/features/settings/seo`, entity forms)
- [X] T019 [US1] Playwright `e2e/specs/seo/seo.spec.ts` (meta, canonical, hreflang, JSON-LD parse, robots per env); manual Rich Results validation log in `reviews/seo-validation.md`

## Phase 4: User Story 2 & 3 — Consent and analytics (P1/P2)

- [X] T020 [US2] DS components `ConsentBanner`, `ConsentPreferences` + `use-consent.ts` with stories/tests (001 conventions); client review
- [X] T021 [US2] Web integration: Consent Mode v2 defaults inline before GTM, gated loading of GTM/GA4/pixel by category, footer "cookie settings" link, consent version from `seo-global`
- [X] T022 [US3] `apps/web/src/lib/analytics.ts` dataLayer bridge (consent-aware) and GTM container export documented in `docs/launch/analytics.md` (events, conversions)
- [X] T023 [US3] Admin dashboard: leads by source/service/page and estimator completions with period filter (API + admin), with e2e `apps/api/test/lead-stats.e2e-spec.ts` (permission, date validation, aggregates)
- [X] T024 [US2] Playwright `e2e/specs/consent/consent.spec.ts` (no third-party requests before consent; category gating; withdrawal; version bump)

## Phase 5: Security & performance

- [X] T025 [P] CSP nonce + security headers in `apps/web/proxy.ts`/`next.config.ts`, report-only on staging first; `Cache-Control: immutable` for hashed static assets and AVIF/WebP image output (FR-034); tests for header presence
- [X] T026 [P] CI: `pnpm audit --prod --audit-level high`, Trivy image scan, Lighthouse CI on staging, ZAP baseline workflow `.github/workflows/zap-baseline.yml`
- [X] T027 Manual security review checklist `docs/launch/security-review.md` (forms, uploads, auth, RBAC/IDOR, CSV injection, rate limits); fix or record client acceptance
- [ ] T028 [P] k6 scripts `tests/load/k6-{home,service,article,contact}.js`; run on staging; record in `reviews/load-test.md`; tune caching/CDN

## Phase 6: User Story 5 — Content complete (P1)

- [X] T029 Content audit script `apps/api/scripts/content-audit.ts` (+ `content:audit` script) with tests; image `licenseNote` field in admin image picker
- [ ] T030 [CLIENT] Content entry and translation in admin (with agy support for bulk import scripts if needed); estimator prices approved and draft flag cleared
- [ ] T031 Run audit until 100% approved; store report `reviews/content-audit.md`

## Phase 7: Compliance documents

- [X] T032 [P] Draft `docs/compliance/record-of-processing.md` (data, purpose, legal basis, retention, access, processors) for client review
- [ ] T033 [P] Final accessibility audit (axe + NVDA/VoiceOver AR/EN) on production content; `docs/compliance/accessibility-statement.{ar,en}.md`; client publishes as a page/section

## Phase 8: User Story 6 — Training (P2)

- [X] T034 [P] Admin guide `docs/admin-guide/{ar,en}.md` (+ PDF export): publish article, update service, manage leads, applications, PDPL export/erase, roles
- [ ] T035 [CLIENT] Create staff accounts with role-based permissions; recorded training session; scripted task test (< 30 min)

## Phase 9: User Story 7 — UAT, go-live, hypercare (P1)

- [X] T036 UAT script `docs/launch/uat.md` from 003 journeys; [CLIENT] executes and signs off
- [X] T037 Go-live runbook `docs/launch/runbook.md` and checklist `docs/launch/go-live-checklist.md` (DNS TTL lowering, cutover, TLS, www→apex, email checks, Search Console verification + sitemap submit, analytics checks, smoke tests, rollback)
- [ ] T038 Execute go-live with the client; record in `reviews/go-live.md`
- [ ] T039 Hypercare 14 days: daily checks log `docs/launch/hypercare.md` (errors, uptime, leads delivered, CWV, Search Console coverage); HSTS preload and DMARC quarantine after stable period
- [ ] T040 Final project report and handover (`docs/STATUS.md` updated, credentials handover checklist, support contacts)

## Dependencies

- Phase 1 now. Phase 2 before 003 needs staging. Phases 3–5 after 003 pages exist. Phase 6 needs 002 admin. Phase 9 last.
- `[CLIENT]` items gate: T030 → T031 → T036 → T038.

## Delegation batches (agy)

Batch A: T006–T011 · Batch B: T004a, T004b, T012–T019 · Batch C: T020–T028 · Batch D: T029, T032–T034, T036–T037.
Backend-area tasks (run in the backend worktree): T014, T016, T018, T023 (API/admin parts), T029.
