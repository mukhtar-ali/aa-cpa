# Implementation Plan: CPA Content & Lead Backend

**Branch**: `002-cpa-content-backend` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-cpa-content-backend/spec.md`

**Implementer**: agy, in its own worktree on branch `002-cpa-content-backend`, separate from the 001 run. It edits
`packages/shared`, `apps/api` and `apps/admin` only. **Planner/reviewer**: Claude (does not write code). The UI runs
(001, 003) never edit these areas.

## Summary

Replace the real-estate domain with the CPA firm's content model and lead capture. Publish bilingual Zod contracts in
`@repo/shared` first (the seam with agy's design system), then extend the NestJS API (Prisma/MySQL) with relational
entities for services, sectors, articles, jobs and reference content, page-level CMS sections for every approved page,
public page endpoints, contact/application/estimator flows with consent, an email outbox, preview tokens, and admin
management screens. Arabic becomes the required/default language across the stack.

## Technical Context

**Language/Version**: TypeScript 5 strict, Node 22.20

**Primary Dependencies**: NestJS 11, Prisma 6 (MySQL 8), Zod 4 + `nestjs-zod`, `nestjs-i18n`, Nodemailer + Handlebars,
sharp, `@nestjs/throttler`, AWS S3 SDK (existing); **new**: `@nestjs/schedule` (outbox worker, retention job).
Admin: Vite 7, React 19, TanStack Router/Query, react-hook-form, shadcn/ui, CKEditor 5 (existing); **new**:
`@dnd-kit/core` + `@dnd-kit/sortable` (reorder lists).

**Storage**: MySQL 8 via Prisma (new/changed models in data-model.md); files in existing S3/local storage (private
bucket prefix for CVs).

**Testing**: Jest unit (`apps/api/src/**/*.spec.ts`) and e2e (`apps/api/test`, real MySQL test DB); Vitest for
`packages/shared` contract tests (new `test` script); Playwright admin journeys in `e2e/specs/` (adapted).

**Target Platform**: Linux containers (existing Dockerfiles / Coolify VPS deploy).

**Project Type**: Monorepo web service + admin SPA + shared library.

**Performance Goals**: public page endpoints p95 < 300 ms at 50 concurrent (SC-003); notification email < 2 min (SC-004).

**Constraints**: Arabic required/default; PDPL consent & erasure; no regression of auth hardening; contracts frozen for
agy after B1 passes (changes via PR note).

**Scale/Scope**: ~16 new/changed tables, ~13 section schemas, ~35 public/admin endpoint groups, ~14 admin screens.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
| --- | --- | --- |
| I. Figma source of truth | PASS | Content model derived from Page 1 frames only (spec Context table) |
| II. Design-system first | PASS (n/a backend) | Web schemas mirror DS view models 1:1 (contracts/shared-schemas.md) |
| III. Arabic-first bilingual | PASS | R3 flips required/default/fallback language to Arabic |
| IV. Accessibility | PASS (n/a) | Admin screens reuse shadcn (accessible); public UI is 001/003 |
| V. Contract-first | PASS | Shared schemas published first (phase US1), admin covers every block |
| VI. Test discipline | PASS | Unit + e2e per endpoint, contract tests, quickstart B1–B8 |
| VII. Performance & SEO | PASS | Caching + revalidation (R11), per-page/per-entity SEO, redirects (R13) |
| VIII. Security & privacy | PASS | Consent records, erasure/export, private CVs, spam controls, throttling |
| Tech constraints | PASS (justified) | 2 new deps justified in Complexity Tracking |

Post-design re-check: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-cpa-content-backend/
├── spec.md
├── plan.md
├── research.md          # R1–R15
├── data-model.md
├── quickstart.md        # B1–B8
├── contracts/
│   ├── shared-schemas.md
│   ├── public-api.md
│   └── admin-api.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
packages/shared/src/
├── validations/  common (changed), site, pages, service, sector, news (changed), job (changed), reference,
│                 contact (changed), estimator, settings  — removed: project, units, inquiry, community,
│                 investor-relation, media, mediaHero, legacy home/about
├── models/       matching z.infer types
├── enums/        premissions.enum.ts (new keys, removed real-estate keys), section-type enum
├── utils/        endpoint.ts (new routes)
└── test/         view-model-fixtures.test.ts, schemas.test.ts   (+ vitest config, "test" script)

apps/api/
├── prisma/schema.prisma, migrations/2026111800xxxx_cpa_domain/, seed.ts (+ --content), seed-content/*.ts
├── src/common/        localize.ts (ar fallback), locale.interceptor.ts (ar default), public-form.guard.ts
│                      (honeypot/min-time/turnstile), image-field.util.ts
├── src/service/       controller, services (one per action, existing pattern), mapper, *.spec.ts
├── src/sector/        idem
├── src/news/          extended (categories, authors, filters, toc, related)
├── src/careers/       extended (departments, closesAt, apply validation, statuses)
├── src/reference/     offices, testimonials, client-logos, credentials, faqs (one module, sub-controllers)
├── src/pages/         page aggregators (home, about, services, sectors, articles, careers, contact, legal) + site chrome
├── src/section/       section schemas registry (type → Zod) for admin GET/PUT
├── src/leads/         contact requests + estimator quotes (replaces contact module internals)
├── src/estimator/     config, calculator (pure), controller
├── src/outbox/        EmailOutbox worker (@nestjs/schedule), revalidate webhook sender
├── src/privacy/       consent records, export/erase, retention job
├── src/preview/       preview token issue/verify
├── src/redirects/     slug redirects
├── public/templates/  lead-*.hbs, application-*.hbs, quote-*.hbs (ar/en)
├── removed: src/project, src/unites, src/inquiry (+ specs)
└── test/              e2e per module (public + admin + permissions)

apps/admin/src/
├── features/  services, sectors, news (extended), article-categories, authors, careers (extended), job-departments,
│              site-content (pages, site chrome, legal, offices, testimonials, client logos, credentials, faqs),
│              leads, applications, estimator, settings/notifications, settings/spam — removed: projects, units, inquiries
├── components/cms/  BilingualField, SortableList, PublishToggle, TranslationStatusBadge, ImageField (w/h/alt)
└── routes/          new route files; sidebar updated (permission-gated)

e2e/specs/  04 (projects) removed; 05, 06, 07, 11 adapted to new entities
```

**Structure Decision**: Keep the existing one-service-per-action NestJS layout and admin feature folders; add modules
listed above. No changes to `apps/web` or `packages/design-system` (agy) in this feature.

## Delivery order (maps to tasks)

1. **US1 Contracts** — shared schemas + fixtures + endpoint map; announce freeze to agy.
2. **US7 Removal** — strip real-estate across api/admin/shared/e2e; Arabic-first changes (R3).
3. **Schema & migrations** — Prisma models, migration, seed `--content`.
4. **US2 Public read API** — entities, sections, page aggregators, caching, redirects, preview.
5. **US3 Contact** + outbox + consent + spam guard.
6. **US4 Applications**.
7. **US5 Estimator** (draft config seeded).
8. **US6 Admin** screens + leads/applications management + privacy tools.
9. Polish: dashboard stats, docs (`docs/STATUS.md`, README), quickstart B1–B8.

## Coordination with agy

- Contracts (US1) merge to `main` early as their own PR so agy's 001 types can align before 001 ends.
- 001 fixtures are copied into `packages/shared/test/fixtures/` by the 002 run; the 001 run notes fixture shape changes
  in its batch reports; Claude reconciles both during review.
- 003 (pages wired to API) starts after US2 is merged.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| `@nestjs/schedule` | Outbox worker + retention job need reliable intervals in-process | Redis/BullMQ adds infrastructure not yet deployed; ad-hoc `setInterval` lacks lifecycle handling |
| `@dnd-kit` in admin | Reordering is required for most content lists | Up/down buttons only would be slow for editors with 10+ logos/items; native DnD lacks keyboard a11y |
| Two text storage styles (TR tables + ML JSON) | Matches existing repo patterns; long/SEO text needs rows, small items do not | One style everywhere forces either dozens of translation tables or unsearchable long text |
