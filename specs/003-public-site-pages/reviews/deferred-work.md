# 003 deferred work: closing round (do at the end of the project)

Status when written (2026-11-24): code complete and committed on `003-public-site-pages` (HEAD `2f1c1f4`), not pushed, no PR. Everything
below was left open on purpose and is to be done in one round after the other features land. Tick the boxes as they are done and record
results in the files named in each item.

## A. Needs a seeded API and the web app running (highest value: nothing has been loaded in a browser yet)

- [ ] **A1. Playwright specs** in `e2e/specs/web/`: removed-routes (T016), navigation (T023), contact (T027), articles (T030), careers (T034), estimator (T037), freshness-preview (T040), api-down (T040a), a11y (T043).
  - Start: API on 3001 (seeded: services, sectors, articles with categories, an open and a closed job, offices, FAQ, an approved estimator config, a testimonial placed on home), then `pnpm --filter @repo/web build && start`.
  - Run: `WEB_BASE_URL=http://localhost:3000 PREVIEW_SECRET=… WEB_REVALIDATE_SECRET=… API_BASE_URL=http://localhost:3001 pnpm exec playwright test --project=web`
  - Extra env: `E2E_CLOSED_JOB_SLUG` (closed job), `E2E_STOP_API_CMD` / `E2E_START_API_CMD` (api-down), `E2E_ESTIMATOR_DRAFT=1` for the not-approved estimator run.
  - Expect fixes: selectors were written without seeing the pages; some assertions will need adjusting. Mark each task in `tasks.md` when green.
- [ ] **A2. Lighthouse CI (T041)**: `pnpm dlx @lhci/cli autorun --config=lighthouserc.json` (14 URLs; budgets ≥ 0.9 and LCP ≤ 2.5 s, CLS ≤ 0.1). Fill the table in `reviews/performance.md`; fix regressions.
- [ ] **A3. Quickstart P1–P6** (`quickstart.md`), including the manual check that a published change is visible in under 60 s (T040).
- [ ] **A4. Preview and revalidation end to end**: issue a token from the API (`POST /api/preview/token`), open the link, confirm drafts show with the banner and noindex; publish in admin and confirm the outbox calls `/api/revalidate`.

## B. Needs a normal drive (the slow `/mnt/e` drive times out)

- [ ] **B1. Design-system tests (T009)**: `pnpm --filter @repo/design-system test`. Covers ErrorState, EmptyState, FormSuccess, PreviewBanner, SkipLink and the stories-coverage guard entries added in 003. jsdom needs ~75 s to load here and vitest allows 60 s.

## C. Design review

- [ ] **C1. Parity review (T024)** at 1512 / 1024 / 768 / 360 px, both languages, every page, against Figma Page 1: home `411:169`, about `445:36452`, services `448:41066`, service `448:41873`, sectors `547:4555`, articles `473:36031`, article `506:2706`, careers `519:38941`, job `514:3194`, contact `524:3651`, privacy `525:3854`, terms `525:4136`. Record in `reviews/parity.md` (template in `final-report.md`). Only About was inspected in Figma during 003; the other pages follow the spec's section order and may differ visibly. Watch the Figma MCP call limit (see memory `figma-mcp-call-limit`).
- [ ] **C2. Client sign-off on designed states** (404, error, maintenance, empty list, form success, closed job, preview banner, accessibility page, estimator-not-approved call to action, Arabic-only notice): table in `reviews/designed-states.md`. These are not in the approved Figma pages.

## D. Code gaps

- [ ] **D1. Style audit** (T042b): 13.8 % non-layout classes in `app/**` vs the 5 % target. Add four design-system components (feature 001 follow-up): `FigureCard` (framed photo with caption), `FactList` (job facts), `Notice` (Arabic-only notice), `NumberedList` (About commitments), then replace the page code. Details and the counting method: `reviews/style-audit.md`.
- [ ] **D2. No-JS submit** for the contact and job application forms: the design-system forms are client components without a native `action`. Give `ContactFormLayout` and `ApplicationFormLayout` a `<form action>` progressive-enhancement path (use `useActionState` with the existing Server Actions), then restore the no-JS cases in `contact.spec.ts` and `careers.spec.ts` (T027, T034).
- [ ] **D3. Turnstile** on contact, application and quote forms when `spam-settings.turnstileEnabled` is on (the API already accepts `turnstileToken`).
- [ ] **D4. Upload progress bar** in the application form: the XHR in `src/components/ApplyForm.tsx` already receives progress events; the design-system form has no slot for them.
- [ ] **D5. Estimator and testimonial on service detail**: the service API payload has none, so the page shows the contact call to action. Either extend `GET /api/services/:slug` (002) or fetch `/api/estimator` plus a testimonial on the page.
- [ ] **D6. Page-level caching**: pages render per request (research R3 amendment) because CI builds without an API. If CDN caching is wanted, build against a seeded API in the deploy pipeline and restore `generateStaticParams` + ISR.
- [ ] **D7. `ArticlesPageWebSchema`** (shared) does not yet declare `categories` and `pagination`, which the API now returns; add them and rebuild `@repo/shared`.
- [ ] **D8. Deploy requirement**: a proxy in front of the web app must set `X-Real-IP` or append to `X-Forwarded-For` (the app trusts the last entry, `src/lib/client-ip.ts`). Env to set in production: `API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `PREVIEW_SECRET` (same as the API), `WEB_REVALIDATE_SECRET`, `IMAGE_HOSTS`, `BUILD_SHA`, optional `MAINTENANCE_MODE`.

## E. Review

- [ ] **E1. Second-model review of the page components, mappers and actions.** The debate-review reviewer sessions had no shell and could not read the diff (only the first run and the final size-guard commit were covered). First fix the `review-main` / `review-debate` lanes (`delegate-setup`; confirm `--check` shows the reviewer can run `git diff`), then run from the worktree: `TMPDIR=<dir on the same drive> node ~/.claude/skills/debate-review/scripts/review-pr.mjs --local --base integration/001-002` (the clone needs a temp dir on the same device as the repo, or it fails with "Invalid cross-device link").
- [ ] **E2. Re-run `/security-review` on the whole branch** once E1 works.
- [ ] **E3. Open the PR** (`003-public-site-pages` → the integration branch). Call out in the description: the shared-file commit (`package.json`, `pnpm-lock.yaml`: `@axe-core/playwright`), the API changes that live on `integration/001-002` (visibility, list fixes, articles filter, legal sanitization, `str()` fix), and the design-system additions (ErrorState, EmptyState, FormSuccess, PreviewBanner, SkipLink, `ContactFormLayout.defaultService`).

## Done when

All boxes above are ticked, `tasks.md` has no open box except by agreement, and `reviews/final-report.md` is updated with the results.
