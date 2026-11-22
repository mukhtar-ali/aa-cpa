---
description: "Task list for 002-cpa-content-backend (executed by agy; reviewed by Claude)"
---

# Tasks: CPA Content & Lead Backend

**Input**: `specs/002-cpa-content-backend/` — plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (constitution VI). Unit spec beside each service (`*.spec.ts`), e2e per controller in
`apps/api/test/`, contract tests in `packages/shared/test/`. Tests first, failing, then implementation.

**Abbreviations**: `SH` = `packages/shared/src`, `API` = `apps/api`, `ADM` = `apps/admin/src`.

## Phase 1: Setup

- [X] T001 Add Vitest to `packages/shared` (`vitest.config.ts`, `"test": "vitest run"` in `packages/shared/package.json`); exact-pinned dev deps
- [X] T002 [P] Add `@nestjs/schedule` to `API/package.json`; register `ScheduleModule.forRoot()` in `API/src/app.module.ts`
- [X] T003 [P] Add `@dnd-kit/core`, `@dnd-kit/sortable` to `apps/admin/package.json`
- [X] T004 [P] Add env keys to `API/.env.example` and `API/src/config/custom-env.ts`: `WEB_REVALIDATE_URL`, `WEB_REVALIDATE_SECRET`, `PREVIEW_SECRET`, `TURNSTILE_SECRET`, `ESTIMATOR_ALLOW_DRAFT`, `IP_HASH_PEPPER`, `WEB_URL`
- [X] T005 [P] Add MySQL test database bootstrap for e2e (`API/test/setup-db.ts`, `API/test/jest-e2e.json` globalSetup running `prisma migrate reset --force --skip-seed` against `DATABASE_URL_TEST`)

## Phase 2: Foundational

- [X] T006 Write tests `SH/../test/common.schema.test.ts` for Arabic-required `RequiredTitleSchema`, `SlugSchema`, `SaudiMobileSchema`, `ImageFieldSchema`, `PublicFormGuardSchema`
- [X] T007 Update `SH/validations/common.schema.ts` per contracts/shared-schemas.md (Arabic required; new shared schemas) and fix compile errors in callers
- [X] T008 Write `API/src/common/localize.spec.ts` cases for Arabic fallback when `en` is empty; update `API/src/common/localize.ts` (fallback to `ar`) and `API/src/common/locale.interceptor.ts` + `lang.middleware.ts` (default `ar`); update existing specs expecting `en`
- [X] T009 [P] Write `API/src/common/public-form.guard.spec.ts` then implement `public-form.guard.ts` (honeypot, min fill time, optional Turnstile via `spam-settings`; spam → short-circuit 201 without side effects)
- [X] T010 [P] Write spec then implement `API/src/common/image-field.util.ts` and extend `API/src/resource/resource.service.ts` upload response with `width`/`height` (sharp metadata)
- [X] T011 Implement section schema registry `API/src/section/section-registry.ts` mapping `Section.type` → Zod schema (data-model table) with spec; `PUT` validates via registry

## Phase 3: User Story 1 — Shared contracts published (P1) 🎯 MVP

**Independent Test**: quickstart B1.

- [X] T012 [US1] Author view-model fixtures (the 002 run writes them from `specs/001-design-system/data-model.md` + Figma Page 1 copy; the 001 run later verifies them against its mock content in 001 T104) at `packages/shared/test/fixtures/{home,services,articles,careers,contact,sectors}.ar.json`
- [X] T013 [US1] Write failing `packages/shared/test/view-model-fixtures.test.ts` parsing each fixture with its `*WebSchema`
- [X] T014 [P] [US1] Create `SH/validations/site.schema.ts` + `SH/models/site.model.ts`
- [X] T015 [P] [US1] Create `SH/validations/pages.schema.ts` + models (all page sections + web schemas, legal)
- [X] T016 [P] [US1] Create `SH/validations/service.schema.ts` + models
- [X] T017 [P] [US1] Create `SH/validations/sector.schema.ts` + models
- [X] T018 [P] [US1] Extend `SH/validations/news.schema.ts` (+ categories, authors, article web schemas, query filters) + models
- [X] T019 [P] [US1] Extend `SH/validations/job.schema.ts` (+ departments, application schema/statuses, web schemas) + models
- [X] T020 [P] [US1] Create `SH/validations/reference.schema.ts` (offices, testimonials, client logos, credentials, FAQs) + models
- [X] T021 [P] [US1] Rewrite `SH/validations/contact.schema.ts` (ContactRequest, Lead admin/status/source/notes) + models
- [X] T022 [P] [US1] Create `SH/validations/estimator.schema.ts` and `SH/validations/settings.schema.ts` + models
- [X] T023 [US1] Update `SH/enums/premissions.enum.ts` (add keys, `PERMISSIONS_UI` groups; remove projects/media/group_locations) and add `SectionType` enum values
- [X] T024 [US1] Update `SH/utils/endpoint.ts` with all routes in contracts/public-api.md and admin-api.md
- [X] T025 [US1] Export everything from `SH/validations/index.ts`, `SH/models/index.ts`; `pnpm --filter @repo/shared build && test` green (T013 passes)
- [X] T026 [US1] Open contracts PR (`feat(shared): CPA contracts`) to `main`; notify agy to align `packages/design-system/src/types`

## Phase 4: User Story 7 — Real-estate domain removed (P1)

**Independent Test**: quickstart B2.

- [X] T027 [US7] Write e2e `API/test/removed-domain.e2e-spec.ts` (projects/units/inquiry routes 404)
- [X] T028 [US7] Delete `API/src/project`, `API/src/unites`, `API/src/inquiry` and their registrations in `API/src/app.module.ts`; fix dashboard service references in `API/src/dashboard/`
- [X] T029 [US7] Delete shared `project`, `units`, `inquiry`, `community`, `investor-relation`, `media`, `mediaHero`, legacy `home`/`about` schemas/models and their exports in `SH/`
- [X] T030 [US7] Delete admin features `ADM/features/{projects,units,inquiries}` and their routes/sidebar entries/API clients; regenerate route tree
- [X] T031 [US7] Remove real-estate e2e: delete `e2e/specs/04-admin-projects.spec.ts`, adapt `01`, `02`, `09`, `11` assertions
- [X] T032 [US7] Remove `starter-core` CI job from `.github/workflows/ci.yml` and `scripts/strip-domain/` (note in PR)
- [X] T033 [US7] Write data migration step stripping removed permission keys from `users.permissions` (in T035 migration SQL) with spec in `API/prisma/migration-checks.spec.ts`

## Phase 5: Schema, migration, seed (blocks US2–US6)

- [X] T034 Update `API/prisma/schema.prisma` per data-model.md (new models, News/Job/Contact/JobApplication reshapes, enums, indexes, m-n tables)
- [X] T035 Generate migration `API/prisma/migrations/<ts>_cpa_domain/` (drop real-estate tables, reshape tables, migrate `News.thumbnail` → ImageField JSON, `Contact` subject/department drop, applications first/last → fullName); review SQL by hand
- [X] T036 [P] Write seed content modules `API/prisma/seed-content/{services,sectors,articles,jobs,reference,pages,estimator}.ts` with Arabic copy from Figma Page 1 and draft English
- [X] T037 Extend `API/prisma/seed.ts` with `--content` (idempotent upserts) and default sections; update `seed` docs in README

## Phase 6: User Story 2 — Public bilingual content (P1)

**Independent Test**: quickstart B3.

- [X] T038 [P] [US2] Write specs for `API/src/service/services/*` (list, by slug incl. redirect + fallback, admin CRUD, publish guard, reorder) and e2e `API/test/service.e2e-spec.ts`
- [X] T039 [P] [US2] Write specs/e2e for sectors (`API/src/sector/`)
- [X] T040 [P] [US2] Write specs/e2e for articles extension (categories, authors, filters by category/sector/service, featured, toc extraction, related, reading time)
- [X] T041 [P] [US2] Write specs/e2e for jobs extension (departments, open-only, closesAt, similar jobs)
- [X] T042 [P] [US2] Write specs/e2e for reference entities (`API/src/reference/`)
- [X] T043 [P] [US2] Write specs/e2e for page aggregators and site chrome (`API/src/pages/`) validating responses with `*WebSchema`
- [X] T044 [US2] Implement `API/src/service/` module (controller, one service per action, mapper → web/admin schemas)
- [X] T045 [US2] Implement `API/src/sector/` module
- [X] T046 [US2] Extend `API/src/news/` (categories, authors controllers; mapper with toc + readingMinutes + isFallback; filters; related)
- [X] T047 [US2] Extend `API/src/careers/` jobs part (departments controller, extended mapper, open filter)
- [X] T048 [US2] Implement `API/src/reference/` module (offices, testimonials, client logos, credentials, FAQs)
- [X] T049 [US2] Implement `API/src/redirects/` (SlugRedirect write on slug change; lookup in by-slug services; permanent = 308). 004 T016 later migrates SlugRedirect into the general `Redirect` table
- [X] T050 [US2] Implement `API/src/pages/` aggregators (home, about, services, sectors, articles, careers, contact, legal incl. `accessibility`) + `GET /api/site/chrome`; seed `Seo` page keys for every page (`home`, `about`, `services`, `sectors`, `articles`, `careers`, `contact`, `privacy`, `terms`, `accessibility`); estimator block included on home, about, services, service detail, sectors, articles only
- [X] T051 [US2] Implement `API/src/preview/` (token issue in admin, `X-Preview-Token` guard/decorator, no-store header)
- [X] T052 [US2] Add cache headers interceptor for public GETs and revalidation outbox enqueue on publish/update (`API/src/outbox/revalidate.ts`)
- [X] T051a [US2] E2E `API/test/preview.e2e-spec.ts`: token issue requires `manage_content`; valid token returns drafts with `Cache-Control: no-store`; expired/forged token → treated as anonymous; token scope enforced
- [X] T052a [US2] E2E `API/test/cache-revalidate.e2e-spec.ts`: public GET cache headers; publish/update/delete enqueue `revalidate` outbox rows with the correct tags; outbox sender posts to `WEB_REVALIDATE_URL` with secret
- [X] T048a [US2] Tests + implementation for edge cases: `updatedAt`/`updatedById` returned and shown ("updated by/at"); delete of referenced Service/Sector/Category/Department/Office → 409 with references; uploaded images > 2560 px resized and converted (sharp) — in `API/src/common/` and affected modules
- [X] T053 [US2] Run autocannon p95 check (quickstart B3.5); add missing indexes if needed

## Phase 7: User Story 3 — Contact requests (P1)

**Independent Test**: quickstart B4.

- [X] T054 [P] [US3] Write specs for outbox worker (claim with SKIP LOCKED, backoff schedule, failure marking) in `API/src/outbox/outbox.worker.spec.ts`
- [X] T055 [P] [US3] Write e2e `API/test/contact.e2e-spec.ts` (valid, invalid localized errors, consent missing, honeypot, min time, throttling, stored when SMTP down)
- [X] T056 [US3] Implement `API/src/outbox/` (EmailOutbox service, worker interval 30 s, retry endpoint for admin)
- [X] T057 [US3] Implement `API/src/privacy/consent.service.ts` (ConsentRecord with hashed IP, policy version from `legal-privacy`)
- [X] T058 [US3] Implement `API/src/leads/` public `POST /api/contact` (transaction: lead + consent + outbox rows; recipients from `notification-settings`)
- [X] T059 [P] [US3] Add Handlebars templates `API/public/templates/lead-staff.{ar,en}.hbs`, `lead-ack.{ar,en}.hbs`
- [X] T060 [US3] Remove old `API/src/contact` module internals superseded by `leads` (keep route path `/api/contact`)

## Phase 8: User Story 4 — Job applications (P2)

**Independent Test**: quickstart B5.

- [X] T061 [P] [US4] Write specs for file validation by magic bytes (`API/src/careers/helpers/resume-validator.spec.ts`) and e2e `API/test/job-apply.e2e-spec.ts` (valid, wrong type, too big, closed job, consent)
- [X] T062 [US4] Implement resume validator and update `create-job-application.service.ts` (fullName, mobile, linkedinUrl, motivation, private key storage, consent, outbox emails)
- [X] T063 [P] [US4] Add templates `application-staff.{ar,en}.hbs`, `application-ack.{ar,en}.hbs`
- [X] T064 [US4] Signed resume download endpoint with audit event in `API/src/careers/careers.controller.ts`, with e2e `API/test/resume-download.e2e-spec.ts` (permission required, signed URL expiry 5 min, audit event written)

## Phase 9: User Story 5 — Estimator (P2)

**Independent Test**: quickstart B6.

- [X] T065 [P] [US5] Write pure calculator spec `API/src/estimator/calculator.spec.ts` with the draft rule table fixtures (research R10) incl. rounding and clamping
- [X] T066 [P] [US5] Write e2e `API/test/estimator.e2e-spec.ts` (draft hidden, approved estimate, config change, quote creates lead, no PII on estimate)
- [X] T067 [US5] Implement `API/src/estimator/` (calculator, config service via sections, public controller, quote → leads service, monitoring event)
- [X] T068 [P] [US5] Add templates `quote-staff.{ar,en}.hbs`, `quote-ack.{ar,en}.hbs`

## Phase 10: User Story 6 — Admin management (P2)

**Independent Test**: quickstart B7, B8.

- [X] T069 [US6] Write e2e `API/test/admin-permissions.e2e-spec.ts` (each admin route refuses without its permission)
- [X] T069a [P] [US6] Write e2e `API/test/admin-leads.e2e-spec.ts`, `admin-applications.e2e-spec.ts`, `admin-privacy.e2e-spec.ts`, `admin-outbox.e2e-spec.ts` (validation errors, status transitions incl. invalid ones, assignment, notes, CSV with BOM and formula-injection escaping, export/erase results, outbox retry) — failing first
- [X] T070 [US6] Implement leads admin endpoints (list/filter, detail, status, assign, notes, CSV with BOM) in `API/src/leads/`
- [X] T071 [US6] Implement applications admin endpoints (statuses flow, notes, CSV) in `API/src/careers/`
- [X] T072 [US6] Implement `API/src/privacy/` export/erase endpoints + retention job (`@Cron` daily) with specs
- [X] T073 [US6] Build admin CMS kit `ADM/components/cms/{BilingualField,SortableList,PublishToggle,TranslationStatusBadge,ImageField}.tsx` with tests
- [X] T074 [P] [US6] Admin feature `ADM/features/services/` (list with reorder/publish, form with methodology/deliverables/FAQ editors, preview)
- [X] T075 [P] [US6] Admin feature `ADM/features/sectors/`
- [X] T076 [P] [US6] Extend `ADM/features/news/` (category, author, tags, sectors/services, schedule) + `ADM/features/article-categories/`, `ADM/features/authors/`
- [X] T077 [P] [US6] Extend `ADM/features/careers/` (department, office, experience, closesAt, lists, application statuses) + `ADM/features/job-departments/`
- [X] T078 [P] [US6] Admin feature `ADM/features/site-content/` (page section editors per page, site chrome, legal pages, offices, testimonials, client logos, credentials, FAQs)
- [X] T079 [P] [US6] Admin features `ADM/features/leads/` (replaces contact-submissions) and applications views
- [X] T080 [P] [US6] Admin features `ADM/features/estimator/` (questions, factors, status draft/approved with confirmation) and `ADM/features/settings/{notifications,spam}`
- [X] T081 [US6] Update admin sidebar, route permissions and dashboard widgets (`ADM/features/dashboard/`, `API/src/dashboard/`)
- [X] T082a [US6] Component tests (Vitest + Testing Library) for each new admin feature form in `ADM/features/*/__tests__/` (schema validation messages, bilingual tabs, publish guard UI, reorder)
- [X] T082 [US6] Playwright admin journeys: adapt `e2e/specs/05`, `06`, `07`, `11`; add `12-admin-services-sectors.spec.ts`, `13-admin-leads-privacy.spec.ts`

## Phase 11: Polish

- [X] T083 Update `docs/STATUS.md`, `README.md` (domain description, scripts), Swagger tags
- [X] T084 Run quickstart B1–B8; `pnpm lint`, `check-types`, `test`, `build`; open PR `002-cpa-content-backend` → `main`

## Dependencies & Execution Order

- Setup → Foundational → US1 (contracts, merged early) → US7 (removal) → Phase 5 schema → US2 → US3 → US4/US5 (parallel) → US6 → Polish.
- US6 admin screens depend on the corresponding API story.
- agy's 001 can proceed independently; 003 (pages) waits for US2 merge.

## Parallel Opportunities

- Contracts T014–T022 (separate files).
- Test-writing T038–T043; implementation of independent modules T044/T045/T048.
- US4 and US5 entirely parallel; admin features T074–T080.

## Implementation Strategy

1. Contracts PR first (unblocks agy).
2. Removal + schema PR (or same branch, separate commits).
3. Public API → forms → admin, each merged behind passing quickstart scenarios.
