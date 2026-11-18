# Implementation Plan: SEO, Analytics, Compliance & Production Launch

**Branch**: `004-seo-compliance-launch` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Implementer**: agy (code and infrastructure-as-code), in two runs: web/DS run and API/admin run, same branch rules as
before. **Client/PM**: content, legal, DNS, accounts, approvals. **Planner/reviewer**: Claude.

## Summary

Complete SEO (metadata, JSON-LD, Arabic-safe OG images, sitemap/robots, redirects), add a first-party consent manager
gating GTM/GA4/pixels with Consent Mode v2, harden security (CSP nonce, headers, scans, pen-test checklist), stand up
staging/production with backups, monitoring and email authentication, run the content audit, training and UAT, then go
live with a runbook and 14-day hypercare.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.2, NestJS 11, Node 22; shell for ops scripts.
**Primary Dependencies**: existing stack; new: none in app runtime except optional `restic` (server), k6 (load test, dev),
Trivy/ZAP (CI tools).
**Storage**: MySQL (new `Redirect` model); off-site backup bucket.
**Testing**: unit tests for metadata/JSON-LD builders and consent hook; Playwright for consent gating (network
assertions) and SEO tags; Rich Results/hreflang validators (manual + scripted); k6; ZAP baseline.
**Target Platform**: Ubuntu VPS with Docker, TLS reverse proxy; domain `aacpa.sa`.
**Performance Goals**: SC-004 (Lighthouse ≥ 90 production), FR-033 load (500 concurrent, p95 < 1 s cached).
**Constraints**: no tracking before consent; no high/critical vulns; restore < 1 h.
**Scale/Scope**: ~30 code tasks, ~25 operational/client tasks.

## Constitution Check

| Principle | Status | Evidence |
| --- | --- | --- |
| I Figma | PASS | Banner/preferences/accessibility-statement UI designed in 001 language, client-reviewed |
| II Design system | PASS | Consent UI added to DS first |
| III Bilingual | PASS | All SEO, JSON-LD, OG images, banners in AR/EN |
| IV A11y | PASS | Banner focus management, final audit + statement (FR-022) |
| V Contracts | PASS | Redirect + OG endpoints added to `@repo/shared` |
| VI Tests | PASS | Unit + Playwright + scans + load + restore drill |
| VII Perf/SEO | PASS | Core of this feature |
| VIII Security/privacy | PASS | Consent, CSP, scans, pen-test, record of processing |

## Project Structure

### Documentation (this feature)

```text
specs/004-seo-compliance-launch/
├── spec.md · plan.md · research.md (R1–R12, R4b) · data-model.md · quickstart.md (L1–L8) · tasks.md
├── contracts/api-additions.md      # redirects, OG, SEO/consent settings, lead stats (extends 002)
├── contracts/consent-and-seo.md    # consent behaviour and per-page SEO output rules
└── checklists/requirements.md
```

### Source Code

```text
apps/web/src/lib/seo/{page-metadata.ts (extended), json-ld/*.ts (+ tests), og.ts}
apps/web/src/components/JsonLd.tsx
apps/web/app/{sitemap.ts, robots.ts}, apps/web/proxy.ts (redirect map, CSP nonce, env noindex)
packages/design-system/src/layout/{ConsentBanner,ConsentPreferences}/  + src/lib/use-consent.ts
apps/web/src/lib/analytics.ts (dataLayer bridge), app/[lang]/layout.tsx (Consent Mode defaults + gated GTM)
apps/api/src/redirects/ (Redirect CRUD, CSV import, map endpoint)   apps/api/src/og/ (sharp OG renderer)
apps/api/scripts/content-audit.ts                                       apps/admin/src/features/redirects/, seo fields (og image)
deploy/vps/{docker-compose.prod.yml, Caddyfile|traefik, backup/restic-backup.sh, backup/restore.md}
.github/workflows/{ci.yml (+audit, trivy, lhci), deploy-vps.yml (staging + prod environments), zap-baseline.yml}
tests/load/k6-*.js
docs/{launch/runbook.md, launch/go-live-checklist.md, launch/hypercare.md, compliance/record-of-processing.md,
      compliance/accessibility-statement.{ar,en}.md, admin-guide/{ar,en}.md}
```

## Workstreams

1. **SEO** (code): R1–R4.
2. **Consent & analytics** (code + client account): R5.
3. **Security** (code + review): R6, R11.
4. **Infrastructure** (IaC + server): R7–R10.
5. **Content & compliance** (client-led, tooling by agy): R12, legal texts, record of processing, accessibility statement.
6. **UAT, training, go-live, hypercare** (PM-led with runbook).

## Quickstart

See [quickstart.md](./quickstart.md) L1–L8.

## Complexity Tracking

| Addition | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Caddy (server) | Automatic TLS + reverse proxy for 4 hostnames | nginx + certbot needs renewal jobs and more config |
| restic (server) | Encrypted, deduplicated off-site backups with retention | Plain dump copies have no encryption or retention management |
| k6 (dev tool) | FR-033 load test, scriptable in CI | autocannon cannot model multi-page journeys |
| Trivy, OWASP ZAP (CI tools) | FR-031/032 vulnerability and baseline scans | `pnpm audit` alone misses OS packages and runtime issues |
