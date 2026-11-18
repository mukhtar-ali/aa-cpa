# Quickstart & Validation: AA-CPA Public Design System

**Feature**: `001-design-system` | Validation scenarios V1–V7 are the review gates for the PR.

## Prerequisites

- Node 22.20 (`nvm use`), pnpm 9, repository installed (`pnpm install`).
- For Figma work: Figma MCP connected with access to file `1jzfujyx2OJ6EKDRD2X6Xm` (View seat is enough).
- For V5/V6: the web app can run without the API (reference page uses mock data only).

## Commands

```bash
pnpm --filter @repo/design-system tokens          # regenerate tokens from tokens/figma-variables.json
pnpm --filter @repo/design-system storybook       # workbench at http://localhost:6006
pnpm --filter @repo/design-system test            # unit + axe + guard tests
pnpm --filter @repo/design-system build-storybook # static workbench (CI artifact)
pnpm check-types && pnpm lint                     # whole repo
ENABLE_REFERENCE_PAGES=true pnpm --filter @repo/web dev
#   → http://localhost:3000/ar/reference/home and /en/reference/home
pnpm test:e2e --project=design-system             # reference page screenshots, axe, keyboard
node e2e/visual/figma-diff.mjs                    # diff vs Figma export of 411:169 (1512 px)
```

## Validation scenarios

### V1 — Foundations (US1, FR-001…005, SC-001)
1. Run `tokens`; `git diff` shows no changes (generated files up to date).
2. `figma-tokens.test.ts` passes: every variable in `figma-variables.json` exists in `tokens.css` with the same
   value or a documented `a11yOverride`.
3. Storybook → Foundations/Colors, Typography, Spacing, Patterns: names/values match the Figma variable list
   (see spec Context); AR and EN type specimens render in Almarai.
**Expected**: all pass; contrast table (research R4) shown on the Colors page.

### V2 — Primitives & forms (US2, FR-010…022)
1. Each primitive/form story has AR and EN, every variant and state from contracts.
2. Keyboard only: Tab reaches every control; focus ring visible on page, ice, surface, inverse and hero tones.
3. Toggle locale: arrows/chevrons mirror; phone/email stay LTR inside Arabic text.
4. FileUpload: drop a 6 MB PDF → error; a 1 MB DOCX → uploaded state with remove button.
5. `test` passes, including `no-physical-direction` and `no-raw-values` guards; Storybook a11y panel shows 0
   violations.
6. Tailwind scan check: a class used only inside the package (e.g. `bg-bg-surface-ice`) appears in the web
   app's built CSS.

### V3 — Chrome (US3, FR-030…032)
1. Header/Footer stories at 360, 768, 1024, 1512 in AR/EN.
2. <1024 px: menu button opens drawer; focus trapped; Escape closes; focus returns to the button.
3. Active nav item has `aria-current="page"`.
4. Back-to-top scrolls to top; instant when reduced motion is emulated.

### V4 — Sections (US4, FR-040…043)
1. Every section in contracts has stories with: full content, long Arabic/English text, missing optional fields.
2. FAQ: Enter/Space toggles; state announced. Tabs: arrow keys move selection in the correct direction for RTL/LTR.
3. Marquee: pause button stops movement; with reduced motion it is static.
4. Estimator: 4 questions, "question n of 4" + progress bar, currency formatted `12,000,000`, invalid input shows an
   announced error, result step shows range + disclaimer, restart works.
5. TOC: active item follows scroll; activating an entry moves focus to the section heading.

### V5 — Reference homepage parity (US5, SC-003)
1. `ENABLE_REFERENCE_PAGES=true`; open `/ar/reference/home` at 1512×982.
2. `figma-diff.mjs` produces `e2e/visual/out/home-1512-diff.png`; section order identical; no element offset
   > 4 px outside imagery regions (photos are placeholders and masked from the diff).
3. Without the env flag the route returns 404; page has `noindex`.

### V6 — Responsive, bilingual, accessible (SC-004, SC-006)
1. Playwright screenshots 360/768/1024/1512 × AR/EN: no horizontal scroll, no clipped/overlapping text.
2. axe: 0 serious/critical on both locales.
3. Lighthouse mobile on the production build: LCP < 2.5 s, CLS < 0.1, TBT-based INP proxy OK; all categories ≥ 90.

### V7 — Documentation (US6, FR-051, FR-053)
1. Every exported component has a story with `parameters.design` linking its Figma node and a docs page.
2. Package README explains install, tokens, RTL rules and contribution checklist.
3. Coverage report ≥ 90% lines for `packages/design-system/src`.
