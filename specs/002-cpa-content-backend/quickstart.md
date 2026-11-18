# Quickstart & Validation: CPA Content & Lead Backend

**Feature**: `002-cpa-content-backend` — scenarios B1–B8 are the PR review gates.

## Prerequisites

- Node 22.20, pnpm 9, MySQL 8 reachable via `apps/api/.env` `DATABASE_URL`, SMTP test inbox (e.g. Mailpit on
  `localhost:1025`) configured in `.env` fallback.
- `pnpm install`

## Commands

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/api db:migrate            # applies 002 migrations (drops real-estate tables)
pnpm --filter @repo/api seed -- --content      # super admin + Figma-derived bilingual demo content
pnpm --filter @repo/api dev                    # http://localhost:3001, Swagger /api/swagger
pnpm --filter @repo/admin dev                  # http://localhost:3002
pnpm --filter @repo/api test && pnpm --filter @repo/api test:e2e
pnpm --filter @repo/shared test                # contract + fixture tests
pnpm check-types && pnpm lint
```

## Validation scenarios

### B1 — Contracts (US1, FR-001, SC-002)
`pnpm --filter @repo/shared test` passes, including `view-model-fixtures.test.ts` (001 mock fixtures parse with
the web schemas). Every row in contracts/shared-schemas.md "Mapping" has a schema export.

### B2 — Real-estate removal (US7, FR-050, SC-006)
1. On a DB seeded before the migration, run `db:migrate`; `projects`, `units`, `inquiries` tables are gone; users,
   news, jobs, sections rows intact.
2. `GET /api/projects`, `/api/units`, `/api/inquiry` → 404. Admin sidebar has no Projects/Units/Inquiries.
3. A user holding old `admin_portal.projects.*` keys signs in; keys are gone from their permission list.
4. Whole repo `pnpm check-types`, `lint`, `test`, `build` green.

### B3 — Public content (US2, FR-010…021)
1. `GET /api/pages/home?lang=ar` and `?lang=en` validate against `HomePageWebSchema`; all blocks populated.
2. Unpublish a service in admin → it disappears from `/api/services` and `/api/pages/home` after the response cache
   (immediately with preview off + revalidate outbox processed).
3. Remove an English translation → `?lang=en` returns Arabic text with `isFallback: true`.
4. Change a published service slug → old slug returns `{ redirectTo }`.
5. `autocannon -c 50 -d 30 http://localhost:3001/api/pages/home` → p95 < 300 ms.

### B4 — Contact (US3, FR-030, FR-033, FR-034)
1. Valid submission → 201; row `status=new`; `ConsentRecord` written; outbox has staff + acknowledgement emails; both
   arrive in Mailpit within 2 minutes in the submission language.
2. Missing consent / bad mobile → 422 with localized field errors (`ar` and `en`).
3. Honeypot filled or `startedAt` < 3 s → 201 but nothing stored or sent.
4. 6th submission in 10 min from one IP → 429.
5. Stop SMTP, submit → row stored, outbox retries, appears as failed after attempts; restart SMTP + retry → sent.

### B5 — Applications (US4, FR-031)
1. Apply with 1 MB PDF → stored privately; HR + candidate emails; resume download from admin works via 5-min signed URL.
2. `.exe` renamed to `.pdf` → 415; 6 MB → 413; closed job (`closesAt` past) → 409.

### B6 — Estimator (US5, FR-032)
1. With `estimator-config.status = draft`: `GET /api/estimator` → 404 (unless `ESTIMATOR_ALLOW_DRAFT=true`).
2. Approve; estimate for revenue 12,000,000, audit, 2–3 entities, partly organised returns the range computed by the
   rule table (unit test fixture), rounded to 500.
3. Change a factor in admin → next estimate reflects it.
4. Quote request → `ContactRequest` with `source=estimator`, answers and range stored; no PII stored for plain estimates.

### B7 — Admin management (US6, FR-040…042)
1. Editor with only `news.*` cannot PUT a service (403).
2. Create service → Arabic only → publish OK; English badge shows "missing".
3. Reorder sectors by drag → public order changes.
4. Lead: change status, assign, add note, export CSV opens correctly in Excel with Arabic.
5. Preview token opens an unpublished article (web part lands in 003; API returns draft with token, 404 without).

### B8 — Privacy (constitution VIII)
`POST /api/admin/privacy/export {email}` returns all records; `erase` removes leads, applications, CV files and consent
rows for that email and writes an `ErasureLog`; retention job erases applications older than `retentionMonths`.
