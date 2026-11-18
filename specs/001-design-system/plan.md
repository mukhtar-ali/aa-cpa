# Implementation Plan: AA-CPA Public Design System

**Branch**: `001-design-system` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-design-system/spec.md`

**Implementer**: agy (UI owner). Reviewer: Claude + project owner. This plan is self-contained: read it with
[research.md](./research.md), [data-model.md](./data-model.md), [contracts/components.md](./contracts/components.md)
and [quickstart.md](./quickstart.md), and the constitution at `.specify/memory/constitution.md`.

## Summary

Create `@repo/design-system`, a source-shipped React 19 + Tailwind CSS v4 component library generated from the
approved Figma "Page 1" (file `1jzfujyx2OJ6EKDRD2X6Xm`), bilingual (Arabic RTL default, English LTR), WCAG 2.2 AA,
documented in Storybook with AR/EN toggles, unit + axe tested with Vitest, and proven by a reference homepage
route in `apps/web` that matches Figma `411:169` at 1512 px. No backend wiring; content enters through typed
view-model props that will align with `@repo/shared` schemas from feature 002.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Node 22.20 (`.nvmrc`)

**Primary Dependencies**: Tailwind CSS 4.3 (+ `@tailwindcss/postcss` in web, `@tailwindcss/vite` in the
package), `class-variance-authority`, `clsx`, `tailwind-merge`, Radix (`react-dialog`, `react-accordion`,
`react-tabs`, `react-direction`); consumer: Next.js 16.2 App Router (`apps/web`). See research R14.

**Storage**: N/A (UI only)

**Testing**: Vitest + Testing Library + `vitest-axe` (jsdom) in the package; Playwright (`e2e/`) for the
reference homepage (screenshots, axe, Figma diff); Storybook a11y addon during development.

**Target Platform**: Evergreen browsers (last 2 versions of Chrome, Edge, Safari incl. iOS 16+, Firefox,
Samsung Internet); SSR via Next.js on Node 22.

**Project Type**: Monorepo web — new library package + consumer web app.

**Performance Goals**: Reference homepage mobile p75: LCP < 2.5 s, CLS < 0.1, INP < 200 ms; Lighthouse ≥ 90 in all
four categories. Client JS added by the library on the homepage ≤ 35 kB gzip (only interactive leaves).

**Constraints**: Logical CSS only; tokens only; no data fetching or copy in components; server components by
default; reduced-motion respected; no watermarked/unlicensed images committed.

**Scale/Scope**: ~70 exported components (contracts/components.md), 12 page templates served later, 2 locales.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How this plan complies |
| --- | --- | --- |
| I. Figma source of truth | PASS | Only Page 1 frames; every component cites a node (contracts); parity checked at 1512 (quickstart V5) |
| II. Design-system first | PASS | Tokens generated from Figma JSON; guard test bans raw hex/px in feature code; pages compose library only |
| III. Arabic-first, bilingual | PASS | Logical utilities only (guard test), mirrored icons, `Intl` formatting, AR default in `proxy.ts`, stories in AR+EN |
| IV. Accessibility AA | PASS (with token overrides) | Contrast fixes R4 documented; Radix for complex patterns; axe in every test; reduced motion |
| V. Contract-first | PASS | View models documented and mapped to 002 schemas; no API calls in the library |
| VI. Test discipline | PASS | Unit + axe per component, Playwright for reference page, CI gate added |
| VII. Performance & SEO | PASS | RSC-first, `next/font/local`, `next/image` with dimensions, reference page `noindex` |
| VIII. Security & privacy | PASS | No personal data; forms are presentational; consent checkbox component provided for 003 |
| Tech constraints | PASS (justified) | New package + Storybook justified in Complexity Tracking |

Post-design re-check (after Phase 1): PASS — no new violations introduced by data-model or contracts.

## Ownership & coordination (two-agent split)

| Area | Owner | Notes |
| --- | --- | --- |
| `packages/design-system/**` | agy | created by this feature |
| `apps/web/**` | agy | only the changes listed under "apps/web changes" in this feature |
| `e2e/specs/design-system/**`, `e2e/visual/**` | agy | |
| `packages/shared/**`, `apps/api/**`, `apps/admin/**` | Claude | agy MUST NOT edit; request changes via the PR description |
| root `package.json`, `turbo.json`, `pnpm-lock.yaml`, `.github/workflows/**` | shared | changes in their own commit, called out in the PR |

Branch: agy works on `001-design-system` (created) and opens a PR to `main`. Review gates: quickstart V1–V7.

## Project Structure

### Documentation (this feature)

```text
specs/001-design-system/
├── spec.md
├── plan.md               # this file
├── research.md           # decisions R1–R14
├── data-model.md         # view-model types
├── quickstart.md         # validation guide V1–V7
├── contracts/
│   └── components.md     # public component API + Figma nodes
├── checklists/
│   └── requirements.md
└── tasks.md              # /speckit-tasks output
```

### Source Code (repository root)

```text
packages/design-system/                 # NEW  @repo/design-system
├── package.json                        # exports map (R1), scripts: lint, check-types, test, tokens, storybook, build-storybook
├── tsconfig.json                       # extends @repo/typescript-config/react-library.json
├── eslint.config.js                    # extends @repo/eslint-config (react) + jsx-a11y
├── vitest.config.ts                    # jsdom, setup file, coverage
├── vitest.setup.ts                     # jest-dom + vitest-axe matchers
├── .storybook/
│   ├── main.ts                         # react-vite, addons a11y/docs, @tailwindcss/vite
│   └── preview.tsx                     # locale toolbar → lang/dir + DesignSystemProvider; background toolbar; fonts
├── tokens/
│   └── figma-variables.json            # snapshot of Figma variables (+ figmaValue/a11yOverride)
├── scripts/
│   └── build-tokens.mjs                # → src/styles/tokens.css, src/lib/tokens.ts
├── assets/
│   ├── fonts/                          # Almarai 300/400/700/800 woff2 + almarai.css + OFL.txt
│   ├── brand/                          # logo-on-dark.svg, logo-on-light.svg, logo-mark.svg, wordmark.svg
│   └── patterns/                       # flow-lines.svg, dots-grid.svg, logo-lines.svg
└── src/
    ├── styles/
    │   ├── index.css                   # exported as ./styles.css: @import tokens, theme, base; @source "../"
    │   ├── tokens.css                  # GENERATED
    │   ├── theme.css                   # @theme inline mapping + fluid type + motion tokens + rtl helpers
    │   └── base.css                    # body font, focus ring, reduced-motion, prose (article body)
    ├── lib/                            # cn.ts, format.ts, tokens.ts (generated), use-reduced-motion.ts, index.ts
    ├── types/                          # view models (data-model.md), index.ts
    ├── icons/                          # Icon.tsx, generated icon components, index.ts
    ├── primitives/                     # Button/, IconButton/, … each: X.tsx, X.stories.tsx, X.test.tsx, index.ts
    ├── forms/
    ├── layout/
    ├── sections/
    └── __guards__/                     # no-physical-direction.test.ts, no-raw-values.test.ts, figma-tokens.test.ts

apps/web/                               # consumer changes in this feature
├── package.json                        # + "@repo/design-system": "workspace:*"
├── next.config.ts                      # + transpilePackages: ['@repo/design-system']
├── proxy.ts                            # defaultLocale 'en' → 'ar'
├── app/[lang]/layout.tsx               # + Almarai via next/font/local (--font-almarai); html lang/dir per locale
├── app/[lang]/reference/home/page.tsx  # NEW reference homepage (guarded, noindex)
├── src/assets/styles/tailwind.css      # + @import "@repo/design-system/styles.css" (legacy tokens kept until 003)
├── src/reference/home.ar.ts|home.en.ts # NEW mock content typed with library view models
└── public/reference/                   # NEW neutral placeholder photos (licensed/free, no watermarks)

e2e/
├── specs/design-system/reference-home.spec.ts  # NEW screenshots 360/768/1024/1512 × ar/en, axe, keyboard nav
└── visual/figma-diff.mjs                        # NEW pixelmatch vs Figma export of 411:169
```

**Structure Decision**: Monorepo with a new library package consumed by `apps/web`, per research R1. The admin
app is untouched (keeps shadcn/ui).

## Implementation approach (phases for tasks)

1. **Setup** — scaffold package, configs, Storybook, Vitest, turbo `test` task, CI job; wire into `apps/web`
   (transpile, CSS import, font, AR default). Exit: empty story renders in AR/EN; `pnpm check-types` green.
2. **Foundations (US1)** — Figma variables snapshot (`get_variable_defs` 411:169 + radii/shadows via
   `get_design_context` on button, card, section nodes), token generator, theme mapping, fluid type, patterns,
   fonts, guard tests, Foundations stories. Exit: quickstart V1.
3. **Primitives + forms + icons (US2)** — per contracts table. Exit: V2.
4. **Chrome (US3)** — UtilityBar, Header, MobileNav (design 360/768 states first as stories and get client
   sign-off), Footer, PageHero, WhatsAppFloat. Exit: V3.
5. **Sections (US4)** — homepage sections first (needed by US5), then the other pages' sections grouped by page.
   Exit: V4.
6. **Reference homepage (US5)** — mock content AR/EN, route, Playwright specs, Figma diff. Exit: V5–V6.
7. **Docs (US6) & polish** — Storybook docs pages (Introduction, Tokens, RTL rules, Contributing), README in the
   package, contrast table, coverage ≥ 90% lines for `src/`. Exit: V7.

Working method for each Figma-derived component (mandatory for parity):
1. `get_design_context` on the cited node (load the `figma-design-to-code` skill first) → treat output as
   reference only; 2. map every value to an existing token (add a token only if Figma has a variable for it);
3. implement with logical utilities + `cva`; 4. stories for every variant/state in AR and EN; 5. tests;
6. compare the story with `get_screenshot` of the node at the same width.

## Client / designer sign-offs required

1. Contrast overrides (research R4) — acknowledgement.
2. Mobile/tablet layouts and the mobile navigation (FR-031) — review in Storybook at 360/768.
3. Estimator result step and form error summary (team-designed) — review in Storybook.
4. Final imagery: hero portrait and stock photos are placeholders until the client supplies licensed images.

## Risks

| Risk | Mitigation |
| --- | --- |
| Figma desktop-only → mobile ambiguity | design mobile states early (phase 4) and get sign-off before sections |
| Tailwind v4 not scanning package classes | `@source "../"` in package CSS + V2 check that a package-only class appears in web CSS |
| Legacy starter pages break when tokens change | keep legacy tokens in web `tailwind.css` until feature 003 replaces pages |
| Prop shapes diverge from 002 API | data-model alignment table; Claude reviews types against 002 schemas before merge |
| Storybook/Vitest version churn | exact pins; versions ≥ 2 weeks old |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| New workspace package (`packages/design-system`) | Enforced boundary, separate owner, workbench + tests isolated from Next app | Folder inside `apps/web` cannot enforce "no app imports" and mixes ownership in a two-agent split |
| New dev tooling (Storybook, Vitest) | Spec FR-053/FR-054 require a workbench and per-component tests; repo has no frontend test runner | Next-route gallery lacks isolation/a11y tooling; Jest duplicates the Vite toolchain |
| Radix dependencies | Correct ARIA + RTL keyboard behaviour for dialog/accordion/tabs | Hand-rolled widgets carry high a11y risk |
