# Implementation Plan: Public Site Pages Wired to the CMS

**Branch**: `003-public-site-pages` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Implementer**: agy (worktree `E:\www\aa-cpa-003`, branch `003-public-site-pages`, created from `integration/001-002` (or `main` once 001 and
002 US1+US2 merge)). **Planner/reviewer**: Claude.

## Summary

Compose the 12 approved pages in `apps/web` (Next.js 16 App Router) from `@repo/design-system` components, fed by the
002 public API through a typed, schema-validated client and pure mappers; wire forms through Server Actions with
progressive enhancement; add preview, on-demand revalidation, designed error/empty states, language negotiation, and
remove the starter's real-estate pages and visuals.

## Technical Context

**Language/Version**: TypeScript 5 strict, React 19.2, Next.js 16.2, Node 22.20

**Primary Dependencies**: `@repo/design-system` (001), `@repo/shared` (002 contracts), Tailwind 4.3; removed: `gsap`,
`@gsap/react`, `react-toastify` (replaced by inline form feedback), `sass` (if unused).

**Storage**: none (cookies: `NEXT_LOCALE`, draft-mode cookie).

**Testing**: Vitest for mappers/actions/api client (`apps/web/vitest.config.ts`), Playwright e2e in `e2e/specs/web/`
against the full stack (seeded DB), `@axe-core/playwright`, Lighthouse CI (`lighthouserc.json`) in CI.

**Target Platform**: Node 22 container (existing `apps/web/Dockerfile`), evergreen browsers.

**Performance Goals**: SC-002 (Lighthouse ≥ 90, CWV good), freshness < 60 s (SC-004).

**Constraints**: constitution II/III/IV; no hard-coded content; no-JS forms; contracts parsed at the seam.

**Scale/Scope**: 12 routes × 2 locales, 3 forms, 5 support endpoints (revalidate, preview, preview exit, health, apply-upload).

## Constitution Check

| Principle | Status | Evidence |
| --- | --- | --- |
| I Figma | PASS | Page map ties each route to its Page 1 frame; parity review per page |
| II Design system | PASS | Pages import only `@repo/design-system`; new states added to the library first (R7) |
| III Bilingual | PASS | R5 negotiation, dictionaries for chrome labels, CMS for content |
| IV A11y | PASS | Focus on route change, skip link, axe in e2e |
| V Contracts | PASS | R1 schema parsing, R2 mappers |
| VI Tests | PASS | unit + e2e + Lighthouse CI |
| VII Perf/SEO | PASS (performance); SEO items deferred to 004 | R3 ISR + tags; R10 metadata function |
| VIII Security | PASS | Server Actions forward to API; secrets server-only; preview no-index |

## Project Structure

### Documentation (this feature)

```text
specs/003-public-site-pages/
├── spec.md · plan.md · research.md (R1–R10) · data-model.md · quickstart.md (P1–P6) · tasks.md
├── contracts/web-endpoints.md   # routes, route handlers, Server Actions, analytics events
└── checklists/requirements.md
```

### Source Code

```text
apps/web/
├── next.config.ts                 # transpile DS, serverActions.bodySizeLimit 6mb, /news → /articles redirects, images
├── proxy.ts                       # locale negotiation, maintenance mode
├── app/
│   ├── layout.tsx                 # root (fonts from 001)
│   ├── global-error.tsx
│   ├── api/revalidate/route.ts    # POST, secret, revalidateTag
│   ├── api/preview/route.ts       # GET enable draft mode
│   ├── api/preview/exit/route.ts
│   └── [lang]/
│       ├── layout.tsx             # html lang/dir, Header/Footer from /api/site/chrome, skip link, PreviewBanner, WhatsAppFloat
│       ├── not-found.tsx · error.tsx
│       ├── page.tsx                                   # Home
│       ├── about/page.tsx
│       ├── services/page.tsx · services/[slug]/page.tsx
│       ├── sectors/page.tsx
│       ├── articles/page.tsx · articles/[slug]/page.tsx
│       ├── careers/page.tsx · careers/[slug]/page.tsx
│       ├── contact/page.tsx
│       ├── privacy/page.tsx · terms/page.tsx · accessibility/page.tsx
│       └── reference/home/page.tsx                    # from 001 (kept, guarded)
├── src/
│   ├── lib/api/client.ts, endpoints.ts, errors.ts
│   ├── lib/i18n/dictionaries.ts (+ dictionaries/ar.json, en.json: chrome labels only)
│   ├── lib/seo/page-metadata.ts
│   ├── lib/analytics.ts
│   ├── mappers/{chrome,home,about,services,sectors,articles,careers,contact,legal,estimator,image}.ts (+ .test.ts)
│   ├── actions/{contact,apply,estimator}.ts (+ .test.ts)
│   └── components/            # page-level client glue only (e.g. EstimatorClient wiring), no styling
└── removed: app/[lang]/projects, app/[lang]/[slug], app/[lang]/news, app/[lang]/_components, src/components/{units,ui},
            src/animations, src/store/useTransitionStore.ts, legacy fonts

packages/design-system/src/sections/  # new: ErrorState, EmptyState, PreviewBanner, FormSuccess, SkipLink (001 conventions)
e2e/specs/web/                         # journeys per SC-005
lighthouserc.json                      # budgets per template
```

## Delivery batches (for delegation)

1. Setup + foundation: API client, mappers skeleton, dictionaries, layout/chrome, locale proxy, new DS states, removals.
2. Content pages: Home, About, Services, Service details, Sectors, Legal.
3. Articles & careers listings/details (filters, pagination, related, TOC, share).
4. Forms & estimator (actions, no-JS, success/error states, closed job).
5. Preview, revalidation, error/maintenance, analytics hook, Lighthouse CI, full e2e, parity review.

## Quickstart (review gates)

See [quickstart.md](./quickstart.md) P1–P6.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Server Actions proxying to API | No-JS forms + IP forwarding + hidden API internals | Direct browser → API calls need JS and expose CORS/CSRF surface for forms |
| Lighthouse CI (`@lhci/cli`, dev) | Constitution VII requires ≥ 90 on every template, enforced in CI | Manual Lighthouse runs are not repeatable or gating |
| Vitest in `apps/web` (dev) | Mappers/actions/client need fast unit tests (constitution VI); same runner as the design system | Jest would add a second test-config style |
