# 004 verification status and what is still open

Updated 2026-11-24 (second pass). A throwaway MariaDB 10.11 and a copy of the repo on the local disk (`/tmp`, 100x faster than `/mnt/e`) made
it possible to run almost everything. Method: seed a scratch database, build and start the API and web app, run Playwright in real Chrome.

## Verified (all green on the final tree)
| Check | Result |
| --- | --- |
| `pnpm check-types` (turbo, 4 packages) + API `tsconfig.tools.json` (e2e specs, scripts, seed) | pass |
| Lint as CI runs it (shared, design-system, admin, web) and API eslint incl. `test/`, `scripts/`, `prisma/` | 0 errors |
| `pnpm build` (turbo, 5 tasks) and `build-storybook` | pass |
| Unit tests: design-system 906, web 136, admin 17, shared 17, API 797 | pass |
| API e2e (21 suites, 132 tests) on MariaDB, incl. `redirects-db.e2e-spec.ts` (real SQL) | pass |
| All Prisma migrations apply, incl. `20261124120000_redirects` (chain collapse and rename-back rules tested on seeded data) | pass |
| Playwright `web` project against the live stack: seo (23), consent (4), legacy redirects, navigation, contact, careers, estimator, a11y (axe, all pages ar/en), freshness/preview, api-down, removed routes | all pass (see "Run notes") |
| Security headers on the real server (nonce CSP, HSTS, nosniff, frame-ancestors) and `robots.txt` per `APP_ENV` | verified with curl and Chrome |
| Redirect path end to end: admin API (401 without token, create, CSV import, loop rejection, export) -> outbox revalidation -> web proxy 308 (live in ~30 s) -> hit counted in the database | verified |
| OG image over real HTTP (`/api/og`) and visually in Arabic and English (local fonts) | verified |

## Bugs the real run found (all fixed, with tests)
Home, sectors and articles returned 500 when content has no image (NewsCard, GapSection, FeaturedNews, ArticleCardCompact, CaseStoryCard now tolerate it);
the consent banner came before the skip link in tab order; the site had no language switch at all (API never sent `localeSwitch`) and, once added, its accessible name
lacked the visible text (WCAG 2.5.3); footer legal links pointed at `/legal/*` (404); deep unknown paths showed Next's default 404 instead of the designed one;
no page had a meta description when the CMS had none (dictionary defaults added); seed script did not compile (client logo `url`); CMS consent texts used different keys than
`ConsentGate`; `hits` was never counted and redirect changes never refreshed the web cache; `use-consent` tests used an invalid cookie mock; legacy-redirects spec used `__dirname` in ESM;
several specs from 003 were wrong about the real UI (tab order, estimator flow, fake PDF fixture, `getByLabel` ambiguity).

## Run notes
- The API throttles the contact form (5 per 10 minutes per IP): restart the API (or wait) between repeated e2e runs.
- Prisma refuses `migrate reset` when it detects an AI agent, so the e2e global setup only logs a warning; migrate the e2e database yourself once.
- The apps run as in CI on a fast disk; on `/mnt/e` the design-system vitest cannot start (jsdom takes 80 s to load, the worker start limit is 60 s). Run tests from a copy on the Linux filesystem or in CI.
- Seed content references client logo and credential images that are not in `apps/web/public` (404s): they come from the client (T005). Do not ship placeholder credential logos.

## Still not verified here
- **Docker**: `docker compose -f deploy/vps/docker-compose.prod.yml config`, image builds (including the `fonts-noto-core` layer in `apps/api/Dockerfile`), Trivy. No Docker in this environment.
- **Workflows and shell scripts**: `actionlint` and `shellcheck` could not be installed (downloads blocked). The workflows are YAML-valid and the scripts pass `bash -n` only. Deploy, rollback, ZAP, Lighthouse and security workflows have never run on GitHub.
- **Lighthouse** budgets (SC-004): not installed locally; run `lighthouse-staging.yml` after the first staging deploy.
- **Caddy**: header syntax and the `{$WEB_ROBOTS_TAG:index, follow}` default unverified in a real Caddy.
- **VPS-dependent**: backup/restore drill (T011), rollback drill (T011a), monitoring and alert drill, CSP report-only week, k6 load test (T028), email DNS checks.
- **Client-dependent**: T001-T005 inputs, T030/T031 content and audit, T033 final accessibility audit with NVDA/VoiceOver, T035 training, T038-T040.
- Rich Results Test per template (needs the public internet) and the Facebook/LinkedIn share debugger.

## Open decisions and follow-ups
1. Production runs the CSP in `report-only` (`CSP_MODE`); switch to `enforce` after one clean week on staging.
2. Seeded `site-chrome` and `estimator` content is demo content: replace via admin before UAT.
3. Shared files changed in this branch (`.github/**`, `playwright.config.ts`, `turbo.json`, `packages/shared`, `apps/api/eslint.config.mjs`, `apps/api/package.json`) should be committed separately per CLAUDE.md.
4. Removed `apps/api/prisma/move-resumes-to-private.ts` and its npm script: a one-off from the starter that referenced a column that no longer exists and could not compile. Its tested helper in `src/careers/services` remains.
