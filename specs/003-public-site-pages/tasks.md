---
description: "Task list for 003-public-site-pages (executed by agy; reviewed by Claude)"
---

# Tasks: Public Site Pages Wired to the CMS

**Input**: `specs/003-public-site-pages/` — spec.md, plan.md, research.md, quickstart.md; 001 contracts; 002 contracts.

**Tests**: REQUIRED. Unit tests beside mappers/actions/client; Playwright journeys; axe; Lighthouse CI.

**Abbreviations**: `WEB` = `apps/web`, `DS` = `packages/design-system`.

**Per-page task convention**: page file uses only DS components; data via `apiGet` + mapper; `generateMetadata` via
`buildMetadata`; loading/empty states; compare with the Figma frame at 1512 and with stories at 360/768.

## Phase 1: Setup

- [X] T001 Create worktree branch `003-public-site-pages` from `integration/001-002` (or from `main` once 001 and 002 are merged; `main` alone has no design system); `pnpm install`; confirm 001 and 002 contracts present, `packages/design-system` exists and `Localized` is exported from `@repo/shared`
- [X] T002 Add Vitest to `WEB` (`WEB/vitest.config.ts`, `"test"` script) and Playwright project `web` in `playwright.config.ts`
- [X] T003 [P] Add Lighthouse CI config `lighthouserc.json` (every template: home, about, services, service detail, sectors, articles, article, careers, job, contact, privacy/terms/accessibility, 404 — both languages for home; budgets from SC-002) and CI step in `.github/workflows/ci.yml` (shared-file commit)
- [X] T004 [P] Update `WEB/next.config.ts`: `serverActions.bodySizeLimit: '6mb'`, `/:lang/news/:path*` → `/:lang/articles/:path*` permanent, image remote patterns from env

## Phase 2: Foundational

- [X] T005 Write tests then implement `WEB/src/lib/api/client.ts` (`apiGet`/`apiPost`, timeout, tags, preview header, schema parse, typed errors) and `endpoints.ts`
- [X] T006 [P] Write tests then implement `WEB/src/mappers/image.ts` (`ImageField` → `ImageRef`; development-build console warning for non-decorative images missing alt text — FR-014) and `WEB/src/mappers/chrome.ts` (`SiteChromeWeb` → header/footer props incl. locale switch)
- [X] T007 [P] Implement chrome-label dictionaries `WEB/dictionaries/labels/{ar,en}.json` (the legacy `dictionaries/{ar,en}.json` are deleted in T014) + typed loader `WEB/src/lib/i18n/dictionaries.ts` (labels only: menu, close, read more, form labels/errors fallback, empty states)
- [X] T008 Update `WEB/proxy.ts` per research R5 (cookie → Accept-Language → `ar`; maintenance mode) with unit tests; the language switcher (T010) sets the `NEXT_LOCALE` cookie (1 year, path `/`) through a small client helper or Server Action, with a unit test and an assertion in the T023 e2e (FR-002 "remembered")
- [ ] T009 [P] Add DS sections `ErrorState`, `EmptyState`, `PreviewBanner`, `FormSuccess`, `SkipLink` in `DS/src/sections/` with stories + tests (001 conventions)
- [X] T010 Rewrite `WEB/app/[lang]/layout.tsx`: html lang/dir, fonts, skip link, Header/Footer/MobileNav/WhatsAppFloat from `/api/site/chrome` (WhatsApp button hidden below md while a form field has focus — FR-004), PreviewBanner when draft mode, focus reset on navigation
- [X] T011 [P] Implement `WEB/src/lib/seo/page-metadata.ts` (`buildMetadata`) with tests (canonical, alternates ar/en/x-default=ar, OG basics)
- [ ] T012 [P] Implement `WEB/src/lib/analytics.ts` typed `track()` forwarding to the monitoring endpoint through `MonitoringReporter` (done, with tests; page views are already sent by the reporter); wire `page_view` (client route-change listener in the locale layout) and `contact_click{channel}` on header, footer, contact page and WhatsApp float links
- [X] T013 Implement `WEB/app/[lang]/not-found.tsx`, `error.tsx`, `WEB/app/global-error.tsx` using DS `ErrorState`

## Phase 3: User Story 7 — Starter leftovers removed (P1)

- [X] T014 [US7] Delete starter routes and components listed in research R8; remove `gsap`, `@gsap/react`, `react-toastify`, legacy fonts and tokens; fix imports; keep `reference/` and `src/reference` (guarded, see f71b9df). Rewrite the legacy `careers`, `contact` and `news` pages and `sitemap.ts` so nothing imports removed `@repo/shared` models (see `specs/002-cpa-content-backend/KNOWN-ISSUES.md`). Gate: `pnpm --filter @repo/web check-types` and `pnpm turbo run build --filter=@repo/web` both green, re-run at the end of every batch
- [X] T015 [US7] Rewrite `WEB/app/sitemap.ts` minimal version (static pages + services/articles/jobs) without removed types (004 completes it)
- [ ] T016 [US7] (written, not yet run: needs API + web running) Playwright `e2e/specs/web/removed-routes.spec.ts` (old project/unit URLs → 404 page; `/news` redirects)

## Phase 4: User Story 1 — Browse in Arabic/English (P1) 🎯 MVP

- [X] T017 [P] [US1] Mapper + tests `WEB/src/mappers/home.ts`; page `WEB/app/[lang]/page.tsx` (Figma `411:169`) (estimator block arrives with T035)
- [X] T018 [P] [US1] Mapper + tests `about.ts`; page `WEB/app/[lang]/about/page.tsx` (Figma `445:36452`)
- [X] T019 [P] [US1] Mapper + tests `services.ts`; pages `services/page.tsx` (`448:41066`) and `services/[slug]/page.tsx` (`448:41873`) with `generateStaticParams`, permanent redirect on moved slug (FR-003), contact CTA with `?service=`
- [X] T020 [P] [US1] Mapper + tests `sectors.ts`; page `sectors/page.tsx` (`547:4555`), sector links → `/articles?sector=`
- [X] T021 [P] [US1] Mapper + tests `legal.ts`; pages `privacy/page.tsx` (`525:3854`), `terms/page.tsx` (`525:4136`), `accessibility/page.tsx` (legal layout, content from 004)
- [X] T022 [US1] Mapper + tests `contact.ts`; page `contact/page.tsx` (`524:3651`) content parts (channels, offices map, FAQ) — form wired in US2
- [ ] T023 [US1] Playwright `e2e/specs/web/navigation.spec.ts`: all pages × 2 langs render, nav/footer links resolve, language switch keeps page, fallback Arabic block has `dir="rtl"` (written, not yet run: needs API + web running)
- [ ] T024 [US1] Parity review per page at 1512/360/768/1024; record in `specs/003-public-site-pages/reviews/parity.md`

## Phase 5: User Story 2 — Contact (P1)

- [X] T025 [US2] Write tests then implement Server Action `WEB/src/actions/contact.ts` (FormData → `ContactRequestSchema` incl. `landingPath`, forward IP and `Accept-Language`, map 422/429 errors, track `lead_submitted`) per `contracts/web-endpoints.md`
- [X] T026 [US2] Wire `ContactFormLayout` + DS form fields on `contact/page.tsx` with `useActionState`, error summary focus, `FormSuccess`, honeypot/startedAt, Turnstile when enabled, `?service=` preselect (no-JS submit not supported: the DS form has no native action; Turnstile not wired)
- [ ] T027 [US2] Playwright `e2e/specs/web/contact.spec.ts` (valid, invalid, no-JS via `javaScriptEnabled: false`, double submit, keyboard only, axe, consent checkbox links to `/{lang}/privacy`, WhatsApp float hidden while typing on mobile) (written, not yet run; no-JS case dropped, see T026)

## Phase 6: User Story 5 — Articles & case stories (P2)

- [ ] T028 [P] [US5] Mapper + tests `articles.ts`; page `articles/page.tsx` (`473:36031`): featured block, category filter chips as links, pagination links, `?sector=` filter, empty state
- [ ] T029 [P] [US5] Page `articles/[slug]/page.tsx` (`506:2706`): header, body, TOC, author, share box (track `article_shared`), related carousel, case-story variant, permanent redirect on moved slug (FR-003)
- [ ] T030 [US5] Playwright `e2e/specs/web/articles.spec.ts` (filter URL, pagination, TOC, share copy, related)

## Phase 7: User Story 4 — Careers & applications (P2)

- [ ] T031 [P] [US4] Mapper + tests `careers.ts`; page `careers/page.tsx` (`519:38941`) with department filter links, team section, hiring steps
- [ ] T032 [US4] Page `careers/[slug]/page.tsx` (`514:3194`): summary card, lists, benefits, share, similar jobs, closed state, permanent redirect on moved slug (FR-003)
- [ ] T033 [US4] Tests then Server Action `WEB/src/actions/apply.ts` (multipart forward, file errors, track `job_applied`); wire `ApplicationFormLayout` with upload progress via the XHR route handler `WEB/app/api/apply-upload/route.ts` (research R4; add it to plan and `contracts/web-endpoints.md`, with a test) and focus on "Apply now"
- [ ] T034 [US4] Playwright `e2e/specs/web/careers.spec.ts` (filter, apply valid PDF, wrong type, too big, closed job, no-JS)

## Phase 8: User Story 3 — Estimator & quote (P2)

- [ ] T035 [US3] Tests then `WEB/src/mappers/estimator.ts` and Server Actions `WEB/src/actions/estimator.ts` (`estimate`, `requestQuote`; track `estimate_completed` and `quote_requested`)
- [ ] T036 [US3] Client glue `WEB/src/components/EstimatorClient.tsx` binding DS `Estimator` to the actions; `EstimatorSection` on home, about, services, service detail, sectors, articles (Figma Page 1); fallback CTA when estimator not approved
- [ ] T037 [US3] Playwright `e2e/specs/web/estimator.spec.ts` (approved flow + quote lead; not-approved fallback)

## Phase 9: User Story 6 — Freshness & preview (P2)

- [ ] T038 [US6] Tests then `WEB/app/api/revalidate/route.ts` (secret, tags validation)
- [ ] T039 [US6] `WEB/app/api/preview/route.ts` and `exit/route.ts` (draft mode, token verify, safe redirect path), `noindex` in draft mode
- [ ] T039a [US6] `WEB/app/api/health/route.ts` (`{ status, version }` from build SHA) with test — used by 004 uptime checks
- [ ] T040a [US6] Resilience test `e2e/specs/web/api-down.spec.ts`: warm the cache, stop the API, cached pages still render; an uncached page shows the branded error with contact details
- [ ] T040 [US6] Playwright `e2e/specs/web/freshness-preview.spec.ts` (publish → visible < 60 s; preview draft; expired token)

## Phase 10: Polish

- [ ] T041 Lighthouse CI passing budgets on all templates; fix regressions; record in `reviews/performance.md`
- [ ] T042 [P] Grep guard test `WEB/src/__guards__/no-hardcoded-copy.test.ts` (no Arabic/Latin sentence literals in `app/**` JSX outside dictionaries)
- [ ] T042a [P] Guard tests `WEB/src/__guards__/no-raw-values.test.ts` and `no-physical-direction.test.ts` over `WEB/app/**` and `WEB/src/**` (same rules as 001 T017/T018 — constitution II/III)
- [ ] T042b [P] Measure styles written outside the library (001 SC-007): count non-layout utility classes in `WEB/app/**`; target < 5%; record in `reviews/style-audit.md`
- [ ] T043 [P] Full axe sweep `e2e/specs/web/a11y.spec.ts` on all pages × 2 langs
- [ ] T044 Collect client sign-off on designed states (404, 500/maintenance, empty, form success, closed job, preview banner, accessibility page) in `reviews/designed-states.md`; update `docs/STATUS.md` web section; batch report `specs/003-public-site-pages/reviews/final-report.md`; run quickstart P1–P6; open PR

## Dependencies

Setup → Foundational → US7 → US1 → (US2, US5, US4 in parallel) → US3 → US6 → Polish. US3 requires 002 US5; US2/US4
require 002 US3/US4.

## Delegation batches

Batch 1: T001–T016 · Batch 2: T017–T024 · Batch 3: T025–T034 · Batch 4: T035–T044.
