# 001 Design system: `packages/design-system` and the reference homepage

Branch `001-design-system` into `main`. 54 commits, about 500 files. Figma file `1jzfujyx2OJ6EKDRD2X6Xm`, page "Page 1" only
(homepage `411:169`).

## What this adds

- **`packages/design-system`**: tokens built from Figma variables (`tokens/figma-variables.json` -> `tokens.css` + `tokens.ts`), 27 SVG
  icons, logos, patterns and the Almarai fonts; primitives, form controls, layout (Header, MobileNav, Footer, PageHero, Section...) and about
  forty section components for the homepage, services, article, jobs, contact, sectors and legal pages. Every component has a story with its
  Figma node, tests with axe in Arabic and English, and logical (RTL-safe) utilities only.
- **Reference homepage** `apps/web/app/[lang]/reference/home`: built only from library components with mock content. It is a 404 unless
  `ENABLE_REFERENCE_PAGES=true`, is `noindex`, is not in the sitemap, and the environment that serves it sends no analytics.
- **Guards**: no physical direction utilities, no raw colours or pixel values outside tokens, Figma tokens match the file, WCAG contrast, every
  component has a story with a Figma URL, Tailwind scans the package.
- **Playwright** `design-system` project: 404 gate, axe, overflow and screenshots at six widths in both languages, keyboard, tabs, marquee,
  estimator flow.

## Shared files changed (review these first)

| File | Change |
| --- | --- |
| `package.json`, `pnpm-lock.yaml` | test script, workspace dependency |
| `turbo.json` | `test` task |
| `playwright.config.ts` | new `design-system` project (the existing `chromium` project ignores its specs) |
| `.github/workflows/ci.yml` | design-system tests, Storybook build and upload |
| `apps/web/Dockerfile` | copies `packages/design-system` (manifest and sources) into the image build |
| `apps/web/package.json`, `next.config.ts`, `proxy.ts`, `app/[lang]/layout.tsx`, `src/assets/styles/tailwind.css` | design-system dependency and transpile, Almarai fonts, default locale `ar`, analytics off when the reference flag is set, token CSS import |

`proxy.ts` now defaults to Arabic for visitors with no locale cookie and no usable `Accept-Language`. That is a sitewide behaviour change.

## Verification (2026-11-22)

- `pnpm lint`, `pnpm check-types` pass for the design system and web app.
- Design-system tests: the last complete local run had 87 of 89 files green (two guard tests timed out on a slow disk; limits raised, they
  pass alone). **The complete suite was not re-run after the last review batch**; the 53 files covering the changes pass. CI is the real
  check. Details in `specs/001-design-system/STATUS.md`.
- Axe: 0 serious or critical violations on `/ar/reference/home` and `/en/reference/home` (Playwright spec).
- Client JavaScript: library chunks 33.3 kB gzip (budget 35 kB), `specs/001-design-system/reviews/performance.md`.
- Lighthouse mobile (simulated slow 4G): performance 77, accessibility 100, best practices 100, SEO 92, CLS 0. **LCP 4 to 6 s against the 2.5 s
  target**; measured LCP is about 1.2 s. Not met; see `performance.md`.
- Figma parity: 10.8 % differing pixels against the 5 % gate. Not met; what remains is text rendering, the hero cut-out and placeholder
  imagery. See `reviews/home-parity.md`.
- Reviews: two-model debate review (no findings; neither reviewer covered the whole diff), a security review (no high-confidence findings), and
  four targeted reviews whose 56 findings are tracked in `reviews/review-backlog.md`.

## Not done / needs a person (full list: `specs/001-design-system/STATUS.md`)

- **Sign-offs** (`reviews/signoffs.md`): contrast overrides, mobile layouts and navigation, estimator result and error summary, final imagery.
  Nothing is approved yet.
- **Imagery**: hero portrait and photos are neutral placeholders.
- **Inferred layouts** (frame not readable): FeaturedNews, TimelineStepper, ContactItem, OfficeMap, contact form (`524:3651`), application
  form (`514:3194`), dark CtaCard. Header height and active-link style are unverified.
- **Lighthouse and parity targets** above.

## Merging with 002

`002-cpa-content-backend` deletes the real-estate models from `@repo/shared`, so the legacy `apps/web` pages no longer compile against it.
`integration/001-002` (local only) shows the resolution: delete the dead routes (`[slug]`, `projects`), move careers and contact to the new
models, export `Localized` from shared. Merge conflicts are limited to `ci.yml` and `pnpm-lock.yaml` once 002's line endings are normalised.

## Screenshots and artefacts

`e2e/specs/design-system/reference-home.spec.ts-snapshots/` (six widths, both languages), `e2e/visual/out/{actual,diff}.png` and `stats.json`
from `node e2e/visual/figma-diff.mjs`, Storybook from CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01TUBtBBMZbfgFZz93kLufai
