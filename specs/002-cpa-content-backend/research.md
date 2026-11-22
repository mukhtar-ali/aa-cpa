# Research: CPA Content & Lead Backend

**Feature**: `002-cpa-content-backend` | **Date**: 2026-11-18 | **Plan**: [plan.md](./plan.md)

Findings from the existing code are cited by path. Format: Decision / Rationale / Alternatives.

## R1. Storage shape: tables vs CMS sections

- **Decision**: Two storage styles, chosen per content type:
  - **Relational entities** (own tables, list/filter/slug/SEO/publish): `Service`, `Sector`, `Article` (existing
    `News`, extended), `ArticleCategory`, `Author`, `Job` (extended), `JobDepartment`, `Office`, `Testimonial`,
    `ClientLogo`, `Credential`, `FaqItem`, `ContactRequest` (existing `Contact`, extended), `JobApplication`
    (extended), `ConsentRecord`, `EmailOutbox`, `SlugRedirect`.
  - **Section JSON singletons** (existing `Section` table + `PageContentService`, `apps/api/src/section/`): page
    blocks per approved page (`page-home`, `page-about`, `page-services`, `page-sectors`, `page-articles`,
    `page-careers`, `page-contact`), `site-chrome`, `legal-privacy`, `legal-terms`, `estimator-config`,
    `notification-settings`, `spam-settings`, plus existing `website-info`, `seo-global`, `email-settings`.
- **Rationale**: Entities need queries, ordering, relations and per-item SEO; page singletons are edited as one
  form and read as one blob — the existing section mechanism already does this with Zod validation.
- **Alternatives**: Everything in sections (no filtering/relations, large blobs, concurrent-edit loss);
  everything relational (dozens of one-row tables for page texts).

## R2. Bilingual text representation

- **Decision**: Keep the repo's two existing patterns: translation tables (`*Translation` with `language`
  enum, `@@unique([parentId, language])`) for entities with long text, SEO fields or slug lookups — `Service`,
  `Sector`, `Article`, `Job`. Multi-language JSON values `{ ar, en }` (`MultiLanguageFieldSchema`) for small
  entities and all section blobs — localized by `localize()` (`apps/api/src/common/localize.ts`).
- **Rationale**: Consistent with `News`/`Job` today; `localize()` already flattens `{ar,en}` at any depth.

## R3. Arabic-first defaults (constitution III) — changes to existing behaviour

Current code makes English mandatory and the fallback (`RequiredTitleSchema` in
`packages/shared/src/validations/common.schema.ts`, `LocaleInterceptor` defaulting to `en`,
`localize()` returning `''` for a missing language).

- **Decision**:
  1. `RequiredTitleSchema` → Arabic required, English optional (rename to keep intent: `RequiredTitleSchema`
     now validates `ar`).
  2. `LocaleInterceptor` and `lang.middleware` default language → `ar`.
  3. `localize()` falls back to Arabic when the requested value is empty, and the mapper for entities adds
     `isFallback: true` when the English translation row is missing (spec FR-012).
  4. Publishing requires complete Arabic required fields; English completeness is reported in admin lists
     (`translationStatus: { ar: 'complete', en: 'missing' | 'partial' | 'complete' }`).
- **Rationale**: Spec FR-012; Arabic is the client's primary language.

## R4. Contracts in `@repo/shared`

- **Decision**: Every new/changed contract is a Zod 4 schema in `packages/shared/src/validations/*.schema.ts`
  with inferred types exported from `packages/shared/src/models/*.model.ts`, and endpoints added to
  `packages/shared/src/utils/endpoint.ts`. Three schema families per entity:
  `XFormSchema` (admin write, multi-language fields), `XAdminSchema` (admin read), `XWebSchema` (public,
  localized strings — mirrors the design-system view model). A contract test in `packages/shared` parses the
  design-system mock fixtures (`apps/web/src/reference/home.*.ts` once 001 lands; until then fixtures copied
  into `packages/shared/test/fixtures/`) with the `XWebSchema`s.
- **Rationale**: Existing repo convention (news/job schemas), spec FR-001/SC-002.
- **Note**: Web schemas are the single source the design-system `types` will migrate to (001 data-model
  "Alignment with 002").

## R5. Removing the real-estate domain

- **Decision**: Use `scripts/strip-domain/strip-domain.mjs` as a reference for touch-points, but do the removal by
  hand for **Projects, Units, Inquiries only** (the script also removes News, Careers, Contact and replaces the
  home/sitemap/dashboard, which we keep). Also remove leftovers from the previous reference project that no
  approved page uses: shared `community`, `investor-relation`, `media`, `mediaHero` models/schemas,
  `AdminPortalProjects*`, `AdminPortalMedia*`, `AdminPortalGroupLocations` permissions, `home-*`/`about-*` legacy
  section schemas replaced by the new page sections. A Prisma migration drops `projects`, `project_translations`,
  `units`, `unit_translations`, `inquiries`. A data migration strips removed permission keys from `users.permissions`.
  The `starter-core` CI job is removed (it targets the old domain layout) — noted in the PR.
- **Rationale**: Spec US7/FR-050. The repo is pre-production (no client data yet), so dropping tables is safe;
  migration still written properly for review.

## R6. Email reliability (spec SC-004)

- **Decision**: Database outbox: submissions write the record and `EmailOutbox` rows in one transaction; a worker
  (`@nestjs/schedule` interval, every 30 s, row-locking with `SELECT … FOR UPDATE SKIP LOCKED`) sends via the
  existing `EmailService`, retries with exponential backoff (1, 5, 15, 60 min, 6 h; max 6 attempts), and marks
  `failed` with the last error. Admin dashboard shows failed count. Templates: Handlebars in
  `apps/api/public/templates/` (ar/en).
- **Rationale**: No Redis in the stack yet (docs/redis-bullmq-plan.md "not started"); an outbox is durable and
  simple; can move to BullMQ later without contract changes.
- **Alternatives**: Fire-and-forget (current; loses mail on SMTP outage), BullMQ now (adds Redis to infra).
- **New dependency**: `@nestjs/schedule` (official Nest scheduler).

## R7. Spam protection & rate limits (FR-033)

- **Decision**: Existing `ThrottlerGuard` with per-route limits (contact 5/10 min/IP, application 5/15 min/IP,
  estimate 30/10 min/IP, quote 5/10 min/IP); honeypot field `website` (must be empty) and minimum fill time
  (`startedAt` ≥ 3 s before submit) in every public form schema; optional Cloudflare Turnstile verification
  controlled by `spam-settings` section (`enabled`, `siteKey`, secret in env `TURNSTILE_SECRET`). Rejected spam
  returns the same 201-shaped success to the client but is not stored or notified.
- **Rationale**: Low-friction protection; CAPTCHA only if spam appears.

## R8. Consent records (PDPL, constitution VIII)

- **Decision**: `ConsentRecord` table: `subjectType` (contact|application|quote), `subjectId`, `email`,
  `purpose`, `policyVersion` (from `legal-privacy.version`), `language`, `ipHash` (SHA-256 with server pepper),
  `userAgent`, `consentedAt`. Every public submission requires `consent: true`. Admin PDPL tools: export all data
  for an email (JSON), and erase (deletes submissions, CV files, consent records except an anonymized erasure log).
  Retention job: applications older than `retentionMonths` (default 12, in `notification-settings`) are erased.
- **Rationale**: Demonstrable consent and data-subject rights.

## R9. File handling for CVs

- **Decision**: Reuse `resource` module private storage (`resumes` already moved private:
  `apps/api/src/careers/services/move-resumes-to-private.ts`); validate by magic bytes (PDF `%PDF`, DOCX zip with
  `word/document.xml`) plus extension and size ≤ 5 MB; signed, short-lived download links for admins; downloads
  audited (`MonitoringEvent` type `cv.download`).

## R10. Estimator (Q1/Q2)

- **Decision**: `estimator-config` section holds `status: 'draft' | 'approved'`, questions, pricing rules,
  disclaimer and labels (bilingual). Public `POST /api/estimator/estimate` computes server-side (rules never
  shipped to the client) and returns `{ min, max, currency: 'SAR', disclaimer, isDraft }`. Public estimator is
  hidden when `status !== 'approved'` unless `ESTIMATOR_ALLOW_DRAFT=true` (staging). Anonymous usage is recorded as
  `MonitoringEvent` (`estimator.completed`) without inputs. Quote request `POST /api/estimator/quote` creates a
  `ContactRequest` with `source: 'estimator'`, `estimatorAnswers`, `estimatedRange`.
- **Draft pricing model** (to be reviewed by the client; values seeded, editable):
  - Questions: (1) annual revenue SAR (currency), (2) service (external audit, zakat & tax, local content
    certification, accounting & bookkeeping, financial due diligence), (3) number of legal entities/branches
    (1, 2–3, 4–10, 10+), (4) state of books (closed monthly, partly organised, not organised).
  - Fee = `serviceBase[service] × revenueBandFactor × entitiesFactor × booksFactor`; range = fee × (0.85 … 1.15),
    rounded to 500 SAR.
  - Seed bands (draft): revenue < 5 M ×1.0, 5–20 M ×1.4, 20–50 M ×1.9, 50–200 M ×2.6, > 200 M ×3.5; entities 1 ×1,
    2–3 ×1.3, 4–10 ×1.7, 10+ ×2.2; books monthly ×1, partly ×1.2, not organised ×1.5; service bases: audit 25,000,
    zakat & tax 12,000, local content 15,000, accounting 18,000 (annual), due diligence 30,000.
- **Rationale**: Server-side rules keep pricing editable and private; draft gate prevents publishing unapproved prices.

## R11. Caching and revalidation (FR-020)

- **Decision**: Public endpoints set `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`; the web
  app (003) fetches with Next tags. On publish/update, the API posts to the web's revalidate endpoint
  (`WEB_REVALIDATE_URL`, `WEB_REVALIDATE_SECRET`) with affected tags (`services`, `service:<slug>`, `articles`,
  `page:home` …), via the outbox mechanism (type `revalidate`). Indexes on `(isPublished, isDeleted, order)` and
  slugs keep queries < 50 ms.
- **Rationale**: Fast pages, immediate updates after publish.

## R12. Preview of unpublished content (FR-042)

- **Decision**: Admin requests a preview token (`POST /api/preview/token`, JWT 15 min, scope entity/page) and
  opens `WEB_URL/api/preview?token=…` (Next draft mode, 003). Public endpoints accept `X-Preview-Token`; when valid,
  unpublished/scheduled items are included and responses are `Cache-Control: no-store`.

## R13. Slug changes

- **Decision**: `SlugRedirect(entityType, fromSlug, toSlug)` written when a published slug changes; public
  by-slug endpoints return `{ redirectTo }` with permanent (308) semantics for the web to follow.

## R14. Admin portal

- **Decision**: Extend `apps/admin` with features following the existing structure (`src/features/<name>/`,
  TanStack Router route, TanStack Query hooks in `src/features/<name>/api.ts`, react-hook-form + zod resolver with
  the shared `XFormSchema`, bilingual tabs ar/en with Arabic first). Reusable admin building blocks to add:
  `BilingualField`, `SortableList` (drag reorder → `PATCH …/reorder`), `PublishToggle`, `TranslationStatusBadge`,
  `ImageUploadField` (exists), `RichTextEditor` (exists).
- **Rationale**: Consistency with the current admin; no new UI framework.

## R15. Seed content

- **Decision**: `apps/api/prisma/seed.ts` gains a `--content` mode that loads Arabic copy transcribed from the
  approved Figma frames plus draft English, 5 services, 8 sectors, 3 offices, sample articles/jobs/FAQs, the draft
  estimator config, and placeholder images. Idempotent (upsert by slug/key).
