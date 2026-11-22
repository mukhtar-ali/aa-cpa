# Project Status (`aa-cpa` — Ahmad Abdullah CPA)

> Consolidated status reflecting the completion of feature `002-cpa-content-backend` (CPA Content & Lead Backend). The legacy real-estate domain (`projects`, `units`, `inquiries`) has been removed and replaced by the CPA firm domain (`services`, `sectors`, `articles`, `careers`, `estimator`, `leads`, `privacy`, `outbox`, `pages`, `preview`).

## Summary

`aa-cpa` is a pnpm + Turborepo monorepo combining a **NestJS 11 + Prisma (MySQL)** backend (`apps/api`), a **Vite + React 19 + shadcn/ui + TanStack Router/Query** admin portal (`apps/admin`), a **Next.js 16 App Router** Arabic-first bilingual (`ar`/`en`) public website (`apps/web`), and shared Zod schemas/models/endpoints (`packages/shared`, `packages/ui`).

Core implementation, the 14 initial audit gaps, all 17 Wujud parity features, and the 42-test Playwright E2E suite are implemented and typecheck cleanly (`pnpm check-types` passes with zero errors).

| Status | Count | Description |
| :--- | :---: | :--- |
| **Done** | 64 | Implemented and verified in `apps/`, `packages/`, `e2e/`, repo tooling |
| **Open** | 7 | Remaining feature gaps, first-run verification, and owner actions |
| **Obsolete** | 4 | Superseded design decisions or stale post-session reminders |

---

## Open Items

### API (`apps/api`)
- **Redis + BullMQ background queues & caching** (`docs/redis-bullmq-plan.md`, MUK-455): emails (`email.service.ts`) and image processing (`resource.service.ts`) still run inline/fire-and-forget, and `@nestjs/throttler` uses in-memory storage. Not started.

### Web (`apps/web`)
- **`ramy-morshedy` pages not ported** (MUK-450/451/452): `/community`, `/investor-relations`, `/media`, unit detail pages, booking modals, and the mega-menu/mobile-drawer header (`CustomHeader.tsx` is still a plain top nav). The reference project lives at `/mnt/e/www/ramy-morshedy`.
- **Brand assets** (MUK-453): `apps/web/public/` and `apps/admin/public/` have no favicon, logo or default OG image. Needs design input from the owner.
- **Visual QA of the GSAP Preloader / PageTransition** (MUK-454): partly done by driving the real stack in a browser (EN/AR, phone/desktop, back/forward, overlay never stuck, no sideways scroll after a fix). Still to do by a person: judge the animation frames themselves and reduced-motion.

### CI / Docker / E2E (written, not yet run)
- **Docker images still unverified in real Docker** (MUK-460): the first CI run showed `api` unhealthy. Root cause found and fixed (runtime images did not copy the per-package `node_modules`, so `@repo/shared` could not be resolved; reproduced with a mocked image layout, fixed layout boots and `/api/health` is 200). The next CI run is the confirmation.
- **First GitHub run pending** (MUK-460, original note): `.github/workflows/ci.yml` (verify job, `docker` job) and the Dockerfiles/compose were verified only as far as possible locally (lint, type-check, tests, build, frozen-lockfile check). Docker is not installed on the dev machine, so the images have **never been built**; the `docker` CI job builds them, runs the stack, smoke-tests the endpoints and the new security regressions on the next push. The Playwright e2e CI job is manual (`workflow_dispatch`). The suite itself has now been run for real against the full stack (see Browser QA pass): 44 of 44 pass.

### Owner actions (cannot be done from the repo)
- **Rotate the real credentials** (MUK-445): the old super-admin and dev-fallback passwords lived in local files and reports before they were removed. They were never pushed, but rotate them anywhere they are used.
- **Seed and verify against a real database** (MUK-446): run `pnpm --filter @repo/api seed` with real `SUPER_ADMIN_*` values (placeholders are now refused) and confirm login.

---

## Done Items

### Monorepo & Shared Packages
- **Workspace & build pipeline**: Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc` (`22.20.0`), and `.npmrc` (with `supportedArchitectures` for `win32` + `linux` to prevent Rollup binary drops across Windows/WSL2).
- **`@repo/shared` (`packages/shared`)**: Built with `tsup`; exports `LanguageEnum` (`en`/`ar`), `PermissionEnum`, `endpoint` map, localized helpers, and Zod schemas/models across all domain modules (`common.schema.ts` updated with `.or(z.literal(''))` for optional URL/email fields).
- **`@repo/ui` (`packages/ui`)**: Shared cookie utilities (`CookieEnum`), base API wrapper, and React hooks consumed by `apps/web`.
- **Tooling configs**: `@repo/typescript-config`, `@repo/eslint-config`, plus app-level flat ESLint configs (`apps/api/eslint.config.mjs`, `apps/admin/eslint.config.js`, `apps/web/eslint.config.mjs`).

### API (`apps/api`)
- **Prisma ORM persistence**: `PrismaModule`/`PrismaService` (`apps/api/src/prisma/`) replacing TypeORM, backed by `apps/api/prisma/schema.prisma` and 4 migrations (`20260604144743_init`, `20260604144744_add_monitoring_tables`, `20260902000000_language_gr_to_ar`, `20260905090341_news_jobs_contact`).
- **Environment-driven seed script**: `apps/api/prisma/seed.ts` reads `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_USERNAME`, `SUPER_ADMIN_FULL_NAME`, and required `SUPER_ADMIN_PASSWORD` from env, validates password strength, tops up super-admin permissions (`ALL_PERMISSIONS`), and seeds default CMS sections.
- **Auth & security (`apps/api/src/auth/`)**:
  - Account lockout (5 failed attempts within 15 minutes locks for 15 minutes) and `LoginAttempt` audit logging.
  - Hashed `RefreshToken` persistence in MySQL, issued via `httpOnly` cookie on `/api/auth/login` and `/api/auth/reset-password`, with **rotation** at `POST /api/auth/refresh` (each refresh revokes the presented token and issues a new one; `refresh_tokens.rotatedAt` marks rotation-revoked tokens, replay within 30 s is accepted as a concurrent-tab race, later replay revokes all of the user's sessions), single-session revocation at `POST /api/auth/logout`, and all-session revocation on password change/reset. Tokens revoked by logout/password change are plain 401s.
  - Scoped double-submit cookie CSRF protection (`csrf-csrf` in `apps/api/src/common/csrf.middleware.ts`) on `/api/auth/refresh` and `/api/auth/logout`, plus `GET /api/auth/csrf-token`.
  - Global `ThrottlerGuard` (60 req/min/IP) registered in `AppModule` with route overrides on auth endpoints (fail-closed: 10/15min, always in production; `AUTH_THROTTLE_LIMIT` raises it only outside production), uploads (50/15min), and job applications (20/15min).
  - Explicit CORS origin allow-list (`ADMIN_PORTAL_URL`, `FRONTEND_URL`) with `credentials: true` in `apps/api/src/main.ts`.
- **Domain & CMS modules**:
  - `users`: Admin user CRUD, profile updates, and OTP password reset flow.
  - `project`: Full CRUD, re-ranking, slug lookup, and bilingual `translations.title` search filter (`GetAllProjectsService`).
  - `unites`: Full CRUD and slug/ID lookup (`apps/api/src/unites/`).
  - `news`: Blog/News & Events CRUD with server-side `sanitize-html` (`apps/api/src/news/`).
  - `careers`: Job postings CRUD, public candidate application endpoint (`POST /api/jobs/apply`) with PDF type validation and a 5 MB cap (multer limit + pipe validator), application status workflow, and notification email (`apps/api/src/careers/`).
  - `section`: Generic JSON CMS sections covering `website-info` (with branding fields), `seo-global`, `email-settings` (masked `smtpPass` on read + `POST /api/common/email-settings/test`), `home-*` (`hero`, `showcase`, `about-teaser`), `about-*` (`hero`, `content`, `mission-vision`, `core-values`, `leadership`, `partners`), and `contact-*` (`hero`, `form`).
  - `contact` & `inquiry`: Public submission endpoints and admin management with `Contact.status` (`new`/`contacted`/`closed`).
  - `seo`: Per-page SEO metadata CRUD (`apps/api/src/seo/`).
  - `resource`: S3 + Sharp image/file upload service (`apps/api/src/resource/`).
  - `email`: Live DB-backed Nodemailer transporter (`EmailService` reads `email-settings` section with `.env` fallback) and Handlebars templates in `apps/api/public/templates/`.
  - `dashboard`: `GET /api/dashboard/stats` aggregating counts, 7-day pageview trends, and recent activity (`apps/api/src/dashboard/`).
  - `monitoring`: Metrics, errors, and events ingestion + rollup queries (`apps/api/src/monitoring/`).

### Admin (`apps/admin`)
- **Auth & API client**: Axios client (`src/lib/api.ts`) with `withCredentials: true`, automatic CSRF token header on refresh/logout (`src/lib/csrf.ts`), deduplicated silent refresh on `401`, `localStorage` user/token persistence (`src/stores/auth-store.ts`), and working 3-step password reset (`/forgot-password` → `/otp` → `/reset-password`).
- **Live Dashboard (`src/features/dashboard/`)**: Overview, Content Pipeline, and Analytics tabs backed by `GET /api/dashboard/stats` (30s polling).
- **Content & system management features**:
  - Users (`src/features/users/`), Projects (`src/features/projects/` with `ImageUploadField`), News (`src/features/news/`), Careers & ATS (`src/features/careers/`), Inquiries (`src/features/inquiries/`), and Contact Submissions (`src/features/contact-submissions/`).
  - Page CMS editors for Home (`src/features/home/`), About (`src/features/about-page/`), and Contact (`src/features/contact-page/`).
  - System Settings (`src/features/settings/`): General Info & Branding (`/settings`), Social Media (`/settings/social`), Page SEO (`/settings/seo`), Global SEO & Tracking (`/settings/seo-tracking`), and Email SMTP + test sender (`/settings/email`).
  - Self-hosted CKEditor 5 wrapper (`src/components/rich-text/rich-text-editor.tsx`) with `S3UploadAdapter` uploading to `/api/upload/image`.
  - Demo `apps` and `tasks` template routes removed; routes and sidebar gated by `PermissionEnum`.

### Web (`apps/web`) & QA (`e2e/`)
- **Bilingual Next.js 16 storefront**: `/[lang]` routing (`en` LTR / `ar` RTL) with hardened `Negotiator`/`@formatjs/intl-localematcher` locale detection in `apps/web/proxy.ts`.
- **Pages & SEO/Tracking**: Home (`/[lang]` with hero slider, showcase, about teaser, and `?q=` project search), Project detail (`/[lang]/[slug]`), About (`/[lang]/about`), News listing & detail (`/[lang]/news`, `/[lang]/news/[slug]`), Careers listing & detail with PDF resume application form (`/[lang]/careers`, `/[lang]/careers/[slug]`), Contact page & form (`/[lang]/contact`), dynamic `app/sitemap.ts`, `app/robots.ts`, `generateMetadata()` + GA/GTM injection in `app/[lang]/layout.tsx`, Meta Pixel (`FBPixel.tsx`), and GSAP page-transition/scroll animations (`src/animations/`).
- **Playwright E2E suite**: 12 spec files (44 tests) under `e2e/specs/`; executed against a local full stack (MariaDB + API + admin + web, system Chrome): 44 pass, including `11-permissions` with a zero-permission user (`E2E_LIMITED_EMAIL` / `E2E_LIMITED_PASSWORD`). The first run found three stale specs, now fixed: an ambiguous `/save|create|add/i` submit selector (the project dialog gained Add-tag/Add-amenity buttons) and an instant assertion on a home-page project list that is cached for 60 s.

---

### Added in the hardening pass
- **Units management UI** (`apps/admin/src/features/units/`, route `/projects/$projectId/units`): table, create/edit dialog covering every `UnitFormSchema` field, single/bulk delete, "Manage units" action on projects.
- **Project `tags` and `amenities` editing** in the Projects dialog (per-language rows, empty rows dropped on submit).
- **Permission gating**: `/inquiries` route + sidebar item gated by `AdminPortalManageContent`; dead `/help-center` link removed; `e2e/specs/11-permissions.spec.ts` added (skips without `E2E_LIMITED_*` env vars).
- **No hardcoded e2e credentials**: `e2e/fixtures/test-helpers.ts` reads `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`; root declares `@playwright/test` and exposes `pnpm test:e2e`; single `pnpm-lock.yaml` (stray npm lockfiles removed; `--frozen-lockfile` verified).
- **API unit tests** (jest + ts-jest, Prisma mocked): 485 tests (29 suites) covering account-wide lockout, hashed refresh tokens, rotation/reuse, revoke-all, CSRF, job-apply validation, auth throttle, production env validation, health, Swagger gating, seed-password check, sanitizer XSS payloads, language middleware, monitoring (permissions, rollup merge), S3 upload/ACL, security headers, server-side search, shared URL/SEO helpers.
- **Refresh-token rotation + reuse detection** (see Auth above; migration `20261108220000_refresh_token_rotated_at`).
- **Auth throttle fails closed** (`auth-throttle.ts`) instead of `NODE_ENV !== 'production' ? 500`.
- **Production safety**: the API refuses to start in production with a missing/short/placeholder `JWT_SECRET` (or explicit `CSRF_SECRET`), missing `DATABASE_URL`, or unset `ADMIN_PORTAL_URL`/`FRONTEND_URL`; Swagger is off in production unless `SWAGGER_ENABLED=true`; public `GET /api/health` for probes; the seed refuses placeholder passwords.
- **Resume upload limits**: API cap of 5 MB (+ single file) and client-side PDF/5 MB validation with en/ar messages in the web form.
- **Container hardening**: admin nginx sends `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` and CSP `frame-ancestors 'none'`; the public web container receives no API secrets; the API runs as the unprivileged MySQL app user in compose.
- **Account-wide login lockout**: failed logins are counted per account across all IPs (5 within 15 min locks for 15 min). Before, they were counted per (user, IP), so rotating IPs gave every IP free guesses.
- **Reverse-proxy awareness**: `TRUST_PROXY` (hop count 1-10 only; `true`/`*` refused and fail startup in production) makes `req.ip` the real client behind Coolify/Traefik/nginx. Without it the per-IP auth limit would apply to all users together. Documented in `docs/DEPLOY.md` and the env templates.
- **Dead admin `/sign-up` stub removed** (route, feature and the "Sign up" footer link on the forgot-password page; admin users are created via `/users`).
- **Tooling**: `apps/api` has a `check-types` script, so root `pnpm check-types` covers api, admin and web.

### Added in the second hardening pass (MUK-464 to MUK-473)
- **`/ar` home page** is served in Arabic (`?lang=` honoured by `LangMiddleware`; home fetches send `Accept-Language`).
- **Rich-text sanitizer** keeps inline images; 34 tests incl. 18 XSS payloads.
- **Monitoring**: read endpoints require `MonitoringView`; rollups merge instead of overwriting (compare-and-swap); the web app now reports Web Vitals, errors and page views (`MonitoringReporter`, honours DNT/GPC, `NEXT_PUBLIC_MONITORING_ENABLED=false`).
- **Admin tables**: real server-side pagination on every list, id-keyed selection, server-side debounced search (`?search=`) with `keepPreviousData`; Users bulk delete/activate/deactivate call the real endpoints; the fake "Invite" was removed. Status / tag / employment-type facet filters are server-side too (`isPublished`, `tag`, `employmentType`, contact `status` query params; multi-select as comma-separated lists), and a filter or search change clears the row selection.
- **Web**: dynamic footer from General settings, per-page SEO from `/api/seo/web`, Cairo font for Arabic, dependency-free `.rich-text` styles. CMS URL fields accept only http(s) (`safeHttpUrl`).
- **Uploads / API hardening**: multer size caps (image 10 MB, PDF 20 MB, video 100 MB), `S3_OBJECT_ACL` (public-read | private | none), `S3_ENDPOINT` / `S3_FORCE_PATH_STYLE` / `S3_PUBLIC_BASE_URL` for R2/MinIO, security-headers middleware, graceful shutdown hooks.
- **Private résumés (MUK-482)**: applicants' résumés (PII) are uploaded under `nest-next-starter/private/` with no public ACL (so a bucket policy that makes `uploads/*` public for media never covers them) and the admin applications list/detail return 15-minute signed GET links (`ResourceService.signedReadUrl`, `@aws-sdk/s3-request-presigner`); only keys this service wrote (under `uploads/` or `private/`, in the configured bucket) are ever signed, and existing public résumés keep working until moved with `pnpm --filter @repo/api resumes:make-private` (dry run by default, `-- --apply` to move; verified against a real database and an S3-protocol server). Applies to every deployment regardless of `S3_OBJECT_ACL`.
- **Local-disk file storage** (Multica: local storage driver): uploads go to S3 when `S3_BUCKET_NAME` is set and otherwise to the server's disk (`STORAGE_DRIVER` forces one). `ResourceService` delegates to `S3Storage` or `LocalStorage` (`apps/api/src/resource/storage/`). Local: `UPLOADS_DIR` (default `apps/api/storage`, a Docker volume in compose), public files at `<API_PUBLIC_URL>/uploads/*` (only the public folder is mounted; `nosniff` + sandbox CSP), résumés never public and opened through HMAC-signed 15-minute links (`/api/files/download`); path-safety and the key allowlist apply to every read and write; startup checks the folder is writable. `next/image` trusts the API origin; Next dev allows localhost images.
- **Self-hosted web fonts**: Inter and Cairo (latin + arabic, variable woff2 from `@fontsource-variable`, OFL) live in `apps/web/src/assets/fonts/` and are loaded with `next/font/local`. `next/font/google` downloaded them while `next build` ran, so an unreachable fonts.googleapis.com on the build server (reproduced by blocking it) failed the web image build with exit code 1; the build no longer needs the network for fonts. Arabic page titles get a taller line box so the animated line mask cannot clip descenders.
- **Sitemap no longer needs the API at build time**: `/sitemap.xml` is rendered on request (`dynamic = 'force-dynamic'`) with an 8 s timeout on its API calls (it lists only the static pages when the API is down). It was prerendered during `next build`, and an unreachable API made the request hang until Next failed the whole image build after three 60 s retries (seen on Coolify, where the API address in `BASE_URL` was not reachable from the build container). The build now passes in ~20 s with an unreachable API.
- **Empty build-time URLs fail the build**: `apps/web/next.config.ts` and `apps/admin/vite.config.ts` throw when `BASE_URL`/`NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SITE_URL`/`VITE_API_URL` is set but empty. Reproduced on Coolify: empty values were baked into the web image (robots.txt showed `Sitemap: /sitemap.xml`), after which every `/en` page hung (a server-side `fetch` of a relative URL never completes) and the admin would have called its own origin. Unset variables still fall back to the localhost defaults.
- **Known limits**: with `S3_OBJECT_ACL=private` the URL returned for general uploads (images, media) is not directly readable; `zod` is now v4 everywhere (shared, api, admin); a Windows-side `pnpm install` is needed once to refresh local `node_modules` (zod 4 and the presigner).

---

## Decisions & Known Gaps (Obsolete / Deliberate Deviations)

- **CSRF scope (Obsolete in `IMPLEMENTATION_PLAN.md` §7.4)**: The initial plan proposed stripping CSRF completely in favor of bearer-only auth. When httpOnly refresh-token cookies were added for Wujud parity, CSRF protection (`csrf-csrf`) was deliberately scoped only to the cookie-authenticated endpoints (`/api/auth/refresh` and `/api/auth/logout`), keeping Bearer-protected CRUD routes free of unnecessary CSRF overhead.
- **CKEditor S3 upload vs Base64**: Instead of Wujud's `Base64UploadAdapter` (which conflicted with server-side HTML sanitization stripping `data:` URIs), `RichTextEditor` uploads inline images to `/api/upload/image` and stores URLs.
- **Dedicated public resume upload (`POST /api/jobs/apply`)**: General `/api/upload/*` endpoints remain admin-permission-gated; anonymous job applicants upload PDF resumes through a dedicated rate-limited endpoint with strict PDF validation.
- **Dashboard polling vs WebSockets**: Dashboard live stats use 30-second TanStack Query polling (`refetchInterval: 30_000`) rather than a WebSocket gateway.
- **Responsive image uploads in Admin**: Shared schemas support separate `desktop`/`tablet`/`mobile` URLs per image field; Admin CMS forms populate all three from a single upload control for simplicity.
- **Previously pending install/migration notes (Obsolete in `REMAINING_ISSUES.md` & `WUJUD_PARITY_PLAN.md`)**: Notes asking the user to run `pnpm install` for `gsap`/`ckeditor5`/`csrf-csrf` and `prisma migrate dev` for News/Jobs/Contact/Auth tables are now obsolete — dependencies are installed and migration `20260905090341_news_jobs_contact` is committed.

### Browser QA pass (full stack on MariaDB, agent-browser)
Checked in a real browser: admin login, News/Units tables (pagination, search keeps focus and filters across pages, server-side Draft facet), public site on phone and desktop in EN and AR (header drawer and Projects dropdown, project units list, unit detail page, inquiry form end to end, RTL, Cairo font). Bugs it found and fixed: the unit page crashed because arrays of `{ en, ar }` were never localized by the API; silent "Validation failed" form errors; "1 Bedrooms"; a page-transition panel that made every page scroll sideways. Also verified on a fresh database: all migrations apply as the least-privilege app user, and the strip-domain drop migration leaves exactly the core tables with no drift.
- **Required titles**: news, projects, jobs and units now require an English title (Arabic optional); the admin forms show "English title is required" and the API rejects blank titles. Previously a blank record could be saved.

---

### Feature 002: CPA Content & Lead Backend (`002-cpa-content-backend`) — Complete
- **Domain Transformation**: Legacy real-estate domain (`projects`, `units`, `inquiries`) completely removed from schema, migrations, API, admin, and shared contracts.
- **CPA Domain Modules**:
  - `services` & `service_translations`: hierarchical practice areas (`parentServiceId`), bilingual fields, ordering, icon keys, tags.
  - `sectors` & `sector_translations`: industries served, bilingual description and challenges.
  - `article_categories`, `authors`, `articles` (`news`): thought leadership, publication workflow, read time, category relations.
  - `job_departments`, `jobs`, `job_applications`: careers and ATS, PDPL-compliant resume intake with HMAC signed 5-minute audit-logged URLs (`AdminPortalApplicationsView`).
  - `estimator`: cost estimation rules engine, step navigation, quote lead generation with draft allowlist bypass.
  - `leads`: consolidated contact and quote requests, UTF-8 BOM CSV exports, status management, internal notes.
  - `privacy`: Saudi PDPL export/erasure endpoints (`POST /api/admin/privacy/export`, `POST /api/admin/privacy/erase`).
  - `outbox`: reliable transactional notification delivery with retry mechanism (`GET /api/admin/outbox`, `POST /api/admin/outbox/:id/retry`).
  - `preview`: HMAC token preview generation across services, sectors, articles, and careers (`POST /api/preview/token`).
- **CMS Kit & Admin Features**:
  - `BilingualField`, `TranslationStatusBadge`, `PublishToggle`, `SortableList`, and `ImageField` in `apps/admin/src/components/cms/`.
  - Admin management interfaces for all 10 CPA modules under `apps/admin/src/features/`.
  - All unit tests (Vitest 16/16) and type-checking passing cleanly with zero errors.
- **Test Coverage**:
  - All 18 E2E test suites in `apps/api/test/` passing cleanly with custom Node 22 native `supertest-shim.ts`.
  - Full TypeScript validation across `@repo/shared`, `@repo/api`, and `@repo/admin`.
