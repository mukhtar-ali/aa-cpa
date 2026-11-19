# Using this repo as a generic starter (core preset)

The repository ships with a Real-Estate / corporate-website domain (Projects, Units, Inquiries, Contact
submissions, News, Careers + job applications) on top of the reusable core. To start a different kind of
product (SaaS, e-commerce, internal tool) run the cleanup script once, on a fresh clone:

```bash
node scripts/strip-domain/strip-domain.mjs            # dry run: lists every change
node scripts/strip-domain/strip-domain.mjs --apply    # applies it (use a clean git tree)
```

## What stays (the core)
Auth (login, lockout, refresh-token rotation, CSRF, throttling), Users + permissions (RBAC), S3 uploads,
Email (SMTP settings + templates), Monitoring (web vitals, errors, page views), Settings / SEO (general
info, social links, page SEO, tracking, email) and the generic Section CMS machinery, plus a small
dashboard (users, today's page views and errors, 7-day trend), the Next.js shell (header, footer,
language switcher, `/en` and `/ar`, sitemap, robots) and the admin shell (sidebar, dashboard,
monitoring, users, settings).

## What the script removes
- **API:** the `project`, `unites`, `inquiry`, `contact`, `news` and `careers` modules; their models and
  enums in `schema.prisma`; it adds a migration that drops their tables (`<timestamp>_strip_domain`).
- **Admin:** the Projects/Units, News, Careers, Inquiries, Contact submissions and Home/About/Contact page
  screens, routes and API clients, plus the sidebar entries and the unread-contact badge.
- **Web:** `[slug]` (projects and units), `about`, `careers`, `contact` and `news` pages, the forms and
  components behind them, and the project menu in the header.
- **API extras:** the `resumes:make-private` script and the list-filter spec that target the removed modules.
- **e2e:** the specs that only exercise those screens (04, 05, 06, 07, 08, 09); the assertions about them are
  removed from specs 01, 02 and 11.
- **Replaced by small generic versions:** the API dashboard service, the admin dashboard page and API type,
  the web home page, sitemap and header (see `scripts/strip-domain/templates/`).

## After running it
1. `pnpm install` (only needed if you changed dependencies) then `pnpm --filter @repo/api db:generate`.
2. `pnpm --filter @repo/api db:deploy` on your database to apply the drop migration.
3. `pnpm build && pnpm check-types` (rebuilds the admin route tree, which drops the removed routes).
4. Review `git diff`; commit.

## Not removed (harmless leftovers)
These are shared, unused-after-the-strip definitions. Delete them when you no longer want them:
the `Home`/`About`/`Contact` section schemas and endpoints in `packages/shared` and the section controller,
the domain permission keys (`AdminPortalProjects*`, `AdminPortalNews*`, `AdminPortalCareers*`), the
domain strings in `apps/web/dictionaries`, the careers email templates, and the seed's default sections.

## Keeping the script honest
Every patch asserts its target text exists, so it stops with an error instead of half-applying when the
repo changes underneath it. CI has a `starter-core` job that applies the script to a fresh checkout and runs
type-check, build and the API tests, so a change that breaks the script fails the build.
