# 003 final report (2026-11-23)

Branch `003-public-site-pages` (worktree `aa-cpa-003`), based on `integration/001-002`. Nothing is pushed.

## Done and verified here

- `tsc --noEmit` clean; 86 web unit tests pass (23 files): mappers, Server Action cores, route handlers (revalidate, health, apply-upload), preview token and redirect safety, proxy (locale, maintenance, preview headers), API client, guards (no hard-coded copy, no raw values, no physical direction).
- `pnpm turbo run build --filter=@repo/web` succeeds with no API reachable (CI condition).

## Built but not run (needs a seeded API and the web app running, or a faster drive)

| Item | Why not run | How |
| --- | --- | --- |
| Playwright specs in `e2e/specs/web/` (removed-routes, navigation, contact, articles, careers, estimator, freshness-preview, api-down, a11y) | no API/seed here | `pnpm exec playwright test --project=web` with `WEB_BASE_URL`, `PREVIEW_SECRET`, `WEB_REVALIDATE_SECRET`; api-down also needs `E2E_STOP_API_CMD`/`E2E_START_API_CMD` |
| Lighthouse CI (T041) | same | `reviews/performance.md` |
| Design-system section tests (T009: ErrorState, EmptyState, FormSuccess, PreviewBanner, SkipLink, plus the guard) | jsdom needs ~75 s to load on `/mnt/e`; vitest allows 60 s | `pnpm --filter @repo/design-system test` on a normal drive |
| Parity review at 1512/360/768/1024 (T024) | needs the running app and Figma side by side | `reviews/parity.md` template below |
| Quickstart P1–P6 | needs the full stack | `specs/003-public-site-pages/quickstart.md` |

## Not met or open

1. **Style audit**: 13.8 % non-layout classes in `app/**` against the 5 % target; the four missing library components are listed in `reviews/style-audit.md`.
2. **No-JS submit** for the contact and application forms: the design-system forms are client components without a native `action`. Dropped from T027/T034.
3. **Turnstile**: not wired into the forms (the API side exists).
4. **Service detail** has no estimator or testimonial: the API's service payload carries neither, so it shows the contact call to action.
5. **Page-level caching**: pages render per request (research R3 amendment) because CI builds without an API.
6. **Designed states** need client sign-off (`reviews/designed-states.md`).
7. Application upload progress is collected by XHR but the design-system form shows no progress bar.
8. Figma frames for About, Services, Service, Sectors, Careers, Contact, Articles, Legal were composed from the section order in the spec and the About frame's structure; only About was inspected in Figma during this run.

## Changes outside `apps/web` and `packages/design-system` (called out for the PR)

- `apps/api`: public reads hide future-dated content (`common/visibility.ts`); service and sector lists use it; articles page gained a `sector` filter and pagination totals. Lives on `integration/001-002` and is merged here.
- `package.json` + `pnpm-lock.yaml`: `@axe-core/playwright` (own commit).
- `packages/design-system`: `ErrorState`, `EmptyState`, `FormSuccess`, `PreviewBanner`, `SkipLink`; `ContactFormLayout` gained `defaultService`.

## Parity review template (T024)

| Page | 1512 | 768 | 1024 | 360 | Notes |
| --- | --- | --- | --- | --- | --- |

## Review round (2026-11-24)

Debate review (claude + agy) raised one finding (upload route buffered the body before the size check): fixed. Later passes could not read the
diff (reviewer sessions have no shell), so the page components and mappers have no second-model review. My own security read fixed:
unsanitized legal HTML (API), CMS `{ar,en}` text never resolving (API), `javascript:`/`data:` links from CMS content (web), and the
client IP taken from the forgeable first `X-Forwarded-For` entry (now `X-Real-IP`, else the last entry).
