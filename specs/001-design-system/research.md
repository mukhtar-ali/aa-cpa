# Research: AA-CPA Public Design System

**Feature**: `001-design-system` | **Date**: 2026-11-18 | **Plan**: [plan.md](./plan.md)

All Technical Context unknowns are resolved below. Each entry: Decision / Rationale / Alternatives.

## R1. Where the library lives

- **Decision**: New workspace package `packages/design-system` (`@repo/design-system`), shipped as TypeScript
  source (no build step), consumed by `apps/web` through `transpilePackages`. Grouped subpath exports:
  `@repo/design-system/{primitives,forms,layout,sections,icons,lib,types}` and `@repo/design-system/styles.css`.
- **Rationale**: A package boundary enforces Constitution II and the "never imports from an app" rule, gives
  the workbench and tests a home, and lets agy own it without touching backend code. Source-shipping avoids a
  second build pipeline; Next.js compiles it. Subpath exports keep client/server boundaries and tree-shaking
  predictable (no single giant barrel).
- **Alternatives**: `apps/web/src/design-system` folder (no enforced boundary; workbench would live inside the
  Next app). Extending `@repo/ui` (it is a compiled hooks/utils package for web; mixing UI there blurs ownership).
  Prebuilt `dist` with tsup (slower dev loop, no benefit for a single consumer).

## R2. Styling approach

- **Decision**: Tailwind CSS v4 utilities driven by CSS custom properties. Tokens are generated into
  `src/styles/tokens.css` (`:root { --color-bg-page: … }`) and mapped with `@theme inline` in
  `src/styles/theme.css`. The package stylesheet declares `@source "../"` so `apps/web` picks up classes used
  inside the package. Variants via `class-variance-authority`; class merging via `tailwind-merge` + `clsx`
  exported as `cn()`.
- **Rationale**: Matches the existing web stack (Tailwind v4.3). Custom properties keep tokens inspectable and
  usable outside Tailwind (SVG, inline styles). `cva` gives typed variant props that mirror Figma's variant
  properties (Style, Size, State, Theme).
- **Alternatives**: CSS Modules (duplicated tokens, no utility reuse); vanilla-extract/Panda (new build tooling,
  conflicts with Tailwind already in use); styled-components (runtime CSS, poor RSC support).

## R3. Token pipeline from Figma

- **Decision**: `packages/design-system/tokens/figma-variables.json` is a checked-in snapshot of the Figma
  variables (from `get_variable_defs` on node `411:169` plus radius/shadow values read with
  `get_design_context` on representative nodes). `scripts/build-tokens.mjs` generates `src/styles/tokens.css`
  and `src/lib/tokens.ts` (typed name list). A unit test asserts every Figma variable has a token and that
  values match, except documented accessibility overrides (R4).
- **Rationale**: Reproducible, reviewable diff when the designer changes a variable (SC-001). No network access
  needed at build time.
- **Alternatives**: Figma REST/Tokens Studio sync (needs tokens and a paid plan seat for variables API; the
  team's seats are View). Hand-written CSS (drifts silently).
- **Naming**: Figma `group/name` → CSS `--{group}-{name}`; Tailwind theme keys follow the same semantics, e.g.
  `bg/page` → `--color-bg-page` → `bg-bg-page`; `text/heading` → `text-heading`; `border/subtle` →
  `border-subtle`; `action/primary` → `bg-action-primary`; spacing uses the Tailwind 4 spacing scale plus named
  `--spacing-section-*` (48/64/80/96) for vertical rhythm.

## R4. Contrast fixes (Constitution IV, spec FR-005)

Measured with WCAG 2.x relative luminance:

| Pair (Figma) | Ratio | Need | Shipped value | New ratio |
| --- | --- | --- | --- | --- |
| white on `action/primary` #238b68 (button label 16 px bold) | 4.23 | 4.5 | `#228664` | 4.50 |
| `text/link` #238b68 on page/surface/ice | 3.57–4.23 | 4.5 | `#1e785a` | 4.56–5.40 |
| `text/muted` #737673 on page/ice | 3.88–4.16 | 4.5 | `#686b68` | 4.56–5.40 |
| gradient end #2d9bc8 (H1–H3 accent line, large text) on page | 2.67 | 3.0 | `#2a91bc` | 3.02–3.57 |
| gradient end used below 24 px / 19 px bold | 2.67 | 4.5 | `#217294` | ≥4.55 |

- **Decision**: Ship the adjusted values as the token values; keep the Figma originals in the JSON as
  `figmaValue` with `a11yOverride: true` and the reason. Differences are below 3% lightness and visually
  near-identical. Gradient accent text is only allowed at large sizes (H1–H3); smaller accent text uses the
  `#217294` solid value. Passing pairs used as-is: heading on page 7.90, inverse on inverse 14.24,
  inverse-muted on inverse 7.61 / on raised 6.06, accent/progress on inverse 5.67.
- **Non-text**: `border/subtle` (1.35:1) is acceptable only for decorative card borders; form-control
  borders and focus rings use `border/strong` / `action/primary` (≥3:1).
- **Follow-up**: Share the table with the designer for acknowledgement (listed in plan "Client/Designer
  sign-offs").

## R5. Fonts

- **Decision**: Almarai (SIL OFL) in weights 300, 400, 700, 800, woff2, Arabic + Latin subsets, stored once in
  `packages/design-system/assets/fonts/`. `apps/web` loads them with `next/font/local` (relative path into the
  package) exposing `--font-almarai`; Storybook loads the same files through `assets/fonts/almarai.css`
  (`@font-face`). The token `--font-family-base: var(--font-almarai), "Almarai", system-ui, sans-serif`.
  Remove Inter/Cairo from the web layout once pages migrate (feature 003); in this feature they stay loaded
  only for legacy starter pages.
- **Rationale**: Self-hosting is already the repo's rule (builds failed when Google Fonts was unreachable).
  Almarai is not a variable font, so four static files are needed. Matching Figma `font/family = Almarai`.
- **Alternatives**: `next/font/google` (build-time network dependency, previously broke Docker builds).

## R6. Component workbench

- **Decision**: Storybook with `@storybook/react-vite` in `packages/design-system/.storybook`, current stable
  major at install time (9.x or newer), exact-pinned. Addons: docs, a11y. Global toolbar: Locale (`ar` | `en`)
  that sets `lang` and `dir` on the preview root and wraps stories in `DesignSystemProvider`; Background
  (page, ice, surface, inverse, hero). Tailwind via `@tailwindcss/vite`. Every story's `parameters.design`
  holds the Figma URL `https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=<id>`.
  Deploy static build as a CI artifact.
- **Rationale**: The industry-standard workbench; a11y addon gives instant axe feedback; Vite builder is fast and
  independent of Next.
- **Alternatives**: Ladle (lighter, weaker docs/a11y ecosystem), a custom Next route gallery (no isolation,
  more code to maintain).

## R7. Testing

- **Decision**: Vitest + `@testing-library/react` + `@testing-library/user-event` + `vitest-axe` on jsdom,
  colocated `*.test.tsx`. Each component test covers: renders with required props; each variant; `dir="rtl"`
  and `dir="ltr"` (icon mirroring class, logical-property classes); keyboard interaction for interactive
  components; `expect(await axe(container)).toHaveNoViolations()`. A guard test scans package sources and
  fails on physical direction utilities (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`,
  `text-right`, `rounded-l*`, `rounded-r*`, `border-l*`, `border-r*`) and on hex colours outside `tokens/`.
  Playwright (existing `e2e/`) adds a reference-homepage project: screenshots at 360/768/1024/1512 in AR and
  EN, axe scan, and a Figma diff script (`pixelmatch`) against the Figma export of `411:169`.
- **Rationale**: Fast unit feedback; automated enforcement of Constitution II/III/IV/VI.
- **Alternatives**: Jest (repo API uses Jest, but Vitest shares the Vite toolchain with Storybook and is ESM-native);
  Storybook test-runner only (slower, browser-only).

## R8. Accessible interactive primitives

- **Decision**: Use Radix UI primitives only where WAI-ARIA patterns are non-trivial: `react-dialog` (mobile nav
  drawer), `react-accordion` (FAQ), `react-tabs` (service tabs, filter tabs where they switch panels),
  `react-select` is NOT used — the form Select is a styled native `<select>` (best mobile and screen-reader
  behaviour, matches Figma closed state). Radix `DirectionProvider` is set from `DesignSystemProvider`.
  Everything else is plain semantic HTML.
- **Rationale**: Radix is already used by `apps/admin`; unstyled, RSC-compatible leaves, correct RTL keyboard
  handling. Minimises custom focus management bugs.
- **Alternatives**: Headless UI, React Aria (heavier), hand-rolled (high a11y risk).

## R9. RTL / bilingual mechanics

- **Decision**: Direction comes from `<html dir>` (set by `apps/web/app/[lang]/layout.tsx`). Components use
  logical utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `rounded-s-*`,
  `border-s`). Directional icons accept `mirror` (default true for arrow/chevron) implemented with the
  `rtl:-scale-x-100` variant. Numbers/dates via `src/lib/format.ts` using `Intl` with locales `ar-SA-u-nu-latn`
  and `en-SA` (Western digits per Figma), currency `SAR`. Default locale changes to `ar` in `apps/web/proxy.ts`.
- **Rationale**: Constitution III; one implementation for both directions.

## R10. Motion

- **Decision**: CSS-only motion inside the library: marquee keyframes (`translateX` with logical direction via
  `--marquee-dir`), accordion height transitions, hover transitions; durations/easings as tokens
  (`--motion-duration-fast 150ms`, `base 250ms`, `slow 400ms`, `--motion-ease-standard`). All disabled under
  `prefers-reduced-motion: reduce`. Marquee has a visible pause/play toggle and pauses on hover/focus-within.
  The existing GSAP preloader/page transition in `apps/web` is untouched in this feature.
- **Rationale**: No JS animation runtime in the library keeps components server-renderable.

## R11. Imagery and assets

- **Decision**: Brand assets (logo on dark/light, logo mark, footer wordmark, flow-lines, dots grid, logo-mark
  pattern, sector/utility icons) are exported from Figma as SVG via the Figma MCP (`get_design_context` asset
  URLs / `download_assets`), optimized with SVGO, and committed under `packages/design-system/assets/` (icons
  converted to React components using `currentColor`). Photos and client logos are NOT part of the library;
  components take `image: { src, alt, width, height }`. The reference homepage uses neutral placeholder photos
  stored in `apps/web/public/reference/`; Figma images with watermarks (e.g. "watermarked_preview", envato)
  MUST NOT be committed.
- **Rationale**: Library stays content-free (FR-050); licensing risk avoided (spec Assumptions).

## R12. Responsive layout

- **Decision**: Container max width 1140 px content (Figma content column x=186–1326 on a 1512 frame) with
  inline padding 16 px (<640), 24 px (≥640), 32 px (≥1024). Breakpoints: `sm 640`, `md 768`, `lg 1024`,
  `xl 1280`, `2xl 1512`. Type scale steps down at `<lg` (H1 48→36→30, H2 40→32→28, H3 33→28→24,
  body-lg 19→17) via fluid `clamp()` tokens. Mobile header switches at `<lg`.
- **Rationale**: Figma is desktop-only; values chosen to keep Figma proportions, reviewed with client (FR-031).

## R13. Reference homepage

- **Decision**: Route `apps/web/app/[lang]/reference/home/page.tsx` (folders starting with `_` are private in
  the App Router and would not route). Guarded: `notFound()` unless `ENABLE_REFERENCE_PAGES=true`; always
  `robots: noindex`; excluded from sitemap. Mock content in `apps/web/src/reference/home.{ar,en}.ts` typed with
  the library's view-model types.
- **Rationale**: Real Next.js rendering (fonts, RSC, images) for parity and Web Vitals checks (SC-003, SC-005).

## R14. Dependency list (new)

| Package | Where | Why |
| --- | --- | --- |
| `class-variance-authority`, `clsx`, `tailwind-merge` | design-system | typed variants, class merging |
| `@radix-ui/react-dialog`, `react-accordion`, `react-tabs`, `react-direction` | design-system | a11y patterns (R8) |
| `storybook`, `@storybook/react-vite`, `@storybook/addon-a11y`, `@storybook/addon-docs` | design-system dev | workbench (R6) |
| `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `vitest-axe` | design-system dev | tests (R7) |
| `@tailwindcss/vite`, `vite`, `@vitejs/plugin-react` | design-system dev | Storybook/Vitest build |
| `svgo` | design-system dev | asset optimisation |
| `@axe-core/playwright`, `pixelmatch`, `pngjs` | root dev | reference page a11y + Figma diff |

All versions exact-pinned to the latest stable release at install time that is at least two weeks old.
