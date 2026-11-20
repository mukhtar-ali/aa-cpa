---
description: "Task list for 001-design-system (executed by agy)"
---

# Tasks: AA-CPA Public Design System

**Input**: `specs/001-design-system/` — plan.md, spec.md, research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: REQUIRED (constitution VI). Every component has a colocated `X.test.tsx` (render, variants, RTL+LTR,
keyboard where interactive, `axe` no violations) written **before** its implementation and failing first.

**Conventions for every component task**
- Folder: `packages/design-system/src/<group>/<Component>/` containing `<Component>.tsx`, `<Component>.stories.tsx`,
  `<Component>.test.tsx`, `index.ts`; re-export from `src/<group>/index.ts`.
- JSDoc `@figma <node-id>` on the component; story `parameters.design.url` = Figma link to that node.
- Before implementing a Figma-derived component: load the `figma-design-to-code` skill, call `get_design_context`
  on the node (file `1jzfujyx2OJ6EKDRD2X6Xm`), map values to tokens only, then compare the story with
  `get_screenshot` of the node. Sector Redesign components (`552:4605`: card grid, tabs, detail panel) are NOT approved — never build them.
- Stories: every variant × state, plus AR and EN (locale toolbar), long-text and missing-optional cases.
- Logical utilities only; no hex/px literals outside `tokens/` (guard tests enforce).
- `"use client"` only on files listed as **C** in contracts/components.md.

**Abbreviations**: `DS` = `packages/design-system`, `WEB` = `apps/web`.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: package scaffold, toolchain, wiring into the web app

- [x] T001 Create `DS/package.json` (`@repo/design-system`, private, `type: module`, `sideEffects: ["**/*.css"]`, exports map for `./styles.css`, `./primitives`, `./forms`, `./layout`, `./sections`, `./icons`, `./lib`, `./types` per contracts "Import paths"; scripts `lint`, `check-types`, `test`, `test:watch`, `tokens`, `storybook`, `build-storybook`)
- [x] T002 Add exact-pinned dependencies to `DS/package.json` per research R14 (runtime: cva, clsx, tailwind-merge, Radix dialog/accordion/tabs/direction; dev: storybook + react-vite + addon-a11y + addon-docs, vitest, @vitest/coverage-v8, jsdom, Testing Library react/user-event/jest-dom, vitest-axe, vite, @vitejs/plugin-react, @tailwindcss/vite, tailwindcss, svgo, typescript, eslint); peer deps `react`, `react-dom` ^19; run `pnpm install` and commit lockfile in its own commit
- [x] T003 [P] Create `DS/tsconfig.json` extending `@repo/typescript-config/react-library.json` (strict, `jsx: react-jsx`, include `src`, `.storybook`, `scripts`)
- [x] T004 [P] Create `DS/eslint.config.js` extending `@repo/eslint-config` React config + `eslint-plugin-jsx-a11y` recommended
- [x] T005 [P] Create `DS/vitest.config.ts` (jsdom, `setupFiles: ['./vitest.setup.ts']`, css: true, coverage v8 over `src/**`, exclude stories) and `DS/vitest.setup.ts` (jest-dom matchers, `vitest-axe` `toHaveNoViolations`, `matchMedia` and `IntersectionObserver` mocks)
- [x] T006 [P] Create `DS/.storybook/main.ts` (framework `@storybook/react-vite`, stories `../src/**/*.stories.tsx`, addons docs + a11y, `viteFinal` adds `@tailwindcss/vite`)
- [x] T007 Create `DS/.storybook/preview.tsx`: import `../src/styles/index.css` and `../assets/fonts/almarai.css`; global toolbar `locale` (`ar` default | `en`) setting `lang`/`dir` on the story root and wrapping in `DesignSystemProvider`; toolbar `tone` (page, ice, surface, inverse, hero) setting background; a11y addon `test: 'error'`
- [x] T008 Add root `test` task to `turbo.json` (`dependsOn: ["^build"]`, outputs `coverage/**`) and root script `"test": "turbo run test"` in `package.json` (shared-file commit)
- [x] T009 Add CI job steps in `.github/workflows/ci.yml` verify job: `pnpm --filter @repo/design-system test` and `build-storybook` with the static build uploaded as an artifact (shared-file commit)
- [x] T010 Add `"@repo/design-system": "workspace:*"` to `WEB/package.json` and `transpilePackages: ['@repo/design-system']` in `WEB/next.config.ts`
- [x] T011 Change `defaultLocale` from `'en'` to `'ar'` in `WEB/proxy.ts`; ensure `WEB/app/[lang]/layout.tsx` sets `<html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>`

**Checkpoint**: `pnpm install`, `pnpm check-types`, `pnpm --filter @repo/design-system storybook` start cleanly.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: utilities, provider, types and guard tests every story depends on

- [x] T012 [P] Implement `cn()` in `DS/src/lib/cn.ts` (clsx + tailwind-merge configured with the custom token class groups) with test `DS/src/lib/cn.test.ts`
- [x] T013 [P] Implement `formatNumber`, `formatCurrency` (SAR), `formatDate` in `DS/src/lib/format.ts` using `Intl` with `ar-SA-u-nu-latn` / `en-SA` (Western digits) with test `DS/src/lib/format.test.ts` (e.g. `12000000` → `12,000,000` in both locales)
- [x] T014 [P] Implement `useReducedMotion` hook in `DS/src/lib/use-reduced-motion.ts` (client) with test
- [x] T015 [P] Create view-model types from data-model.md in `DS/src/types/index.ts` (ImageRef, LinkRef, ActionRef, NavItem, SiteChrome, ContactChannel, Office, Stat, ServiceSummary, Pillar, ProcessStep, MethodologyRow, SectorSummary, CaseStory, ArticleSummary, Author, TocItem, JobSummary, Perk, Testimonial, FaqItem, LogoItem, LegalSection/LegalDocument, EstimatorConfig/EstimatorQuestion, field models)
- [x] T016 Implement `DesignSystemProvider` in `DS/src/layout/DesignSystemProvider/DesignSystemProvider.tsx` (client; props `locale`, `dir`; wraps Radix `DirectionProvider`; exposes `useDesignSystem()` context) with test
- [x] T017 [P] Write guard test `DS/src/__guards__/no-physical-direction.test.ts` that scans `src/**/*.tsx` (excluding stories) and fails on `\b(ml|mr|pl|pr|left|right|rounded-[lr]|border-[lr]|scroll-m[lr]|scroll-p[lr])-` and `text-(left|right)`; allow-list via `// ds-allow-physical: <reason>`
- [x] T018 [P] Write guard test `DS/src/__guards__/no-raw-values.test.ts` failing on hex colours, `rgb(`, and arbitrary px values (`-\[\d+px\]`) in `src/**/*.tsx` outside `src/styles`
- [x] T019 Create barrel files `DS/src/{primitives,forms,layout,sections,icons,lib,types}/index.ts` and verify the exports map resolves from `WEB` with a type-only import in `WEB/src/reference/.keep.ts` (delete after T104)

**Checkpoint**: `pnpm --filter @repo/design-system test` runs (guards green on empty sources).

---

## Phase 3: User Story 1 — Brand foundations match Figma (P1) 🎯 MVP

**Goal**: every Figma variable available as a token; fonts, type scale, spacing, radii, shadows, motion, section tones, patterns.

**Independent Test**: quickstart V1.

### Tests for User Story 1

- [x] T020 [US1] Write `DS/src/__guards__/figma-tokens.test.ts`: loads `DS/tokens/figma-variables.json` and `DS/src/styles/tokens.css`; asserts each variable has a CSS custom property with identical value, or `a11yOverride: true` with `value` ≠ `figmaValue` and a `reason`
- [x] T021 [P] [US1] Write `DS/src/styles/contrast.test.ts` asserting the text/background token pairs listed in research R4 meet ≥ 4.5 (normal) / ≥ 3.0 (large) using a local WCAG luminance helper

### Implementation for User Story 1

- [x] T022 [US1] Create `DS/tokens/figma-variables.json` from `get_variable_defs` on `411:169` (colours, font sizes/line heights/weights, spacing) plus radius, border width and shadow values read via `get_design_context` on button `411:3706`, card `411:3739`, proof box `411:3772`, section `411:3713`, news card `423:1145`, input `522:1185`; include R4 overrides (`action/primary` #228664, `text/link` #1e785a, `text/muted` #686b68, `gradient/end-text-large` #2a91bc, `gradient/end-text` #217294) with `figmaValue` and `reason`
- [x] T023 [US1] Implement `DS/scripts/build-tokens.mjs` generating `DS/src/styles/tokens.css` (`:root` custom properties, naming per research R3) and `DS/src/lib/tokens.ts` (typed token name unions); wire `tokens` script; commit generated files
- [x] T024 [US1] Create `DS/src/styles/theme.css` with `@theme inline` mapping colours, radii, shadows, spacing (`--spacing-section-*`), font family, breakpoints (sm 640, md 768, lg 1024, xl 1280, 2xl 1512), motion tokens (R10) and fluid type tokens per research R12 (`--text-h1` … `--text-body-xs` with paired line heights)
- [x] T025 [US1] Create `DS/src/styles/base.css` (body font/colour, `:focus-visible` ring using `action/primary` 2px + offset, `prefers-reduced-motion` resets, `.ds-prose` article styles placeholder) and `DS/src/styles/index.css` importing tokens, theme, base and declaring `@source "../"`
- [x] T026 [P] [US1] Add Almarai 300/400/700/800 woff2 (Arabic+Latin) and `OFL.txt` under `DS/assets/fonts/`, plus `DS/assets/fonts/almarai.css` (`@font-face`, `font-display: swap`, sets `--font-almarai`)
- [ ] T027 [US1] Load Almarai in `WEB/app/[lang]/layout.tsx` via `next/font/local` (relative path to `packages/design-system/assets/fonts/*`, `variable: '--font-almarai'`, `display: 'swap'`) and import `@repo/design-system/styles.css` at the top of `WEB/src/assets/styles/tailwind.css` (keep legacy starter tokens below it until feature 003)
- [x] T028 [P] [US1] Export pattern SVGs from Figma (flow lines `413:323`, dots grid `411:171`, logo lines `428:2043` light/dark) to `DS/assets/patterns/` optimised with SVGO
- [ ] T029 [US1] Write `DS/src/layout/Pattern/Pattern.test.tsx` then implement `Pattern.tsx` (`name`, `tone`, `aria-hidden`, absolutely positioned with logical insets, mirrored in RTL where directional) + stories
- [x] T030 [US1] Write `DS/src/layout/Container/Container.test.tsx` then implement `Container.tsx` (1140 content, gutters 16/24/32, `size` variants) + stories
- [x] T031 [US1] Write `DS/src/layout/Section/Section.test.tsx` then implement `Section.tsx` (`tone` page/ice/surface/inverse/hero, `rounded` none/top/bottom/both using 32px token radius, `spacing`, optional `pattern`, `aria-labelledby` passthrough) + stories; Figma `411:3713`, `411:3729`
- [ ] T032 [P] [US1] Create Foundations docs stories `DS/src/foundations/Colors.stories.tsx` (swatches from `tokens.ts` incl. Figma name, value, override note and R4 contrast table), `Typography.stories.tsx` (H1–H6, body sizes × weights in AR and EN), `Spacing.stories.tsx`, `Radii-Shadows.stories.tsx`, `Patterns.stories.tsx`

**Checkpoint**: V1 passes.

---

## Phase 4: User Story 2 — Primitives & forms (P1)

**Goal**: all primitives, icons and form controls with every variant/state, bilingual and accessible.

**Independent Test**: quickstart V2.

### Icons

- [ ] T033 [US2] Export icon SVGs from Figma (homepage `411:3741`, `411:3748`, `411:3763`, button icon wrapper `411:3707`, sector icons on `547:4555`, contact/share/meta icons from `527:5423`, `505:3864`, `529:4333`, upload from `522:1214`) to `DS/assets/icons/`, normalised to 24×24 `currentColor`
- [ ] T034 [US2] Add `DS/scripts/build-icons.mjs` generating typed React components into `DS/src/icons/generated/` and the `IconName` union; wire into `tokens` script chain
- [ ] T035 [US2] Write `DS/src/icons/Icon.test.tsx` (decorative by default, named with `title`, mirror class only for directional icons in RTL) then implement `DS/src/icons/Icon.tsx` + gallery story

### Tests first (each [P], separate files)

- [ ] T036 [P] [US2] Write `Button.test.tsx` (4 variants × 2 sizes, renders `<a>` with `href`, disabled/loading → `aria-disabled`/`aria-busy`, end arrow mirrors in RTL, axe) in `DS/src/primitives/Button/`
- [ ] T037 [P] [US2] Write `IconButton.test.tsx` (requires `label`, variants, link mode, axe) in `DS/src/primitives/IconButton/`
- [ ] T038 [P] [US2] Write tests for `Link`, `Heading` (levels vs visual size, accent line only for h1–h3 sizes, gradient class), `Text`, `Eyebrow` in their folders under `DS/src/primitives/`
- [ ] T039 [P] [US2] Write tests for `Chip`, `FilterChipGroup` (radio-like keyboard, `aria-pressed`, RTL arrow order), `MetaPill`, `CategoryBadge`, `Divider`, `Avatar` (initials fallback), `Rating` (accessible label "4 of 5") under `DS/src/primitives/`
- [ ] T040 [P] [US2] Write tests for `Breadcrumbs` (`nav` + `aria-current`), `Pagination` (links, current page, prev/next labels, mirroring), `SlideCounter` (progressbar values), `Logo`, `LanguageToggle` (`hreflang`, `lang` on label) under `DS/src/primitives/`
- [ ] T041 [P] [US2] Write tests for `Field`, `TextInput`, `Textarea`, `Select` (label association, required marker, `aria-invalid`, `aria-describedby` → help + error, dark theme) under `DS/src/forms/`
- [ ] T042 [P] [US2] Write tests for `Checkbox` (label with link, error) and `FileUpload` (picker, drop, rejects >5 MB and wrong type with announced error via `role="alert"`, remove returns to empty, keyboard activation) and `FormErrorSummary` (focus on mount, links to fields) under `DS/src/forms/`

### Implementation

- [ ] T043 [US2] Implement `Button` (cva variants primary/secondary/outline-light/link, sizes md 44px / lg 52px from `64:20`, shadow token, loading spinner, `asChild` via Radix-free Slot util in `DS/src/lib/slot.tsx`) + stories; Figma `64:20`, `411:3706`, `411:3709`, `411:3735`, `411:3714`
- [ ] T044 [US2] Implement `IconButton` + stories; Figma `505:3864`, `529:4427`
- [ ] T045 [P] [US2] Implement `Link`, `Heading`, `Text`, `Eyebrow` + stories; Figma text styles on `411:169`, eyebrow `411:3722`
- [ ] T046 [P] [US2] Implement `Chip`, `FilterChipGroup` (client), `MetaPill`, `CategoryBadge`, `Divider`, `Avatar`, `Rating` + stories; Figma `499:1149`, `529:4333`, `423:1145`, `411:3785`, `411:3878`, `411:3871`
- [ ] T047 [P] [US2] Implement `Breadcrumbs`, `Pagination`, `SlideCounter`, `Logo` (SVGs from Figma `65:56` on-dark, `78:197` on-light into `DS/assets/brand/`), `LanguageToggle` + stories; Figma `530:4416`, `64:28`
- [ ] T048 [US2] Implement `Field`, `TextInput`, `Textarea`, `Select` (native, custom chevron mirrored) with light/dark themes + stories; Figma `522:1185`, dark `411:3863`, select on `524:3651`
- [ ] T049 [US2] Implement `Checkbox`, `FileUpload` (client), `FormErrorSummary` + stories; Figma `522:1194`, `522:1214`
- [ ] T050 [US2] Add `DS/src/__guards__/tailwind-scan.test.ts` or documented manual check (quickstart V2.6) proving package-only classes are emitted in `WEB` CSS

**Checkpoint**: V2 passes.

---

## Phase 5: User Story 3 — Site chrome (P1)

**Goal**: utility bar, header, mobile navigation, footer, page hero, WhatsApp float.

**Independent Test**: quickstart V3.

### Tests

- [ ] T051 [P] [US3] Write `UtilityBar.test.tsx` and `Header.test.tsx` (landmark `banner`, nav `aria-label`, `aria-current`, CTA, desktop nav hidden <lg and menu button shown) under `DS/src/layout/`
- [ ] T052 [P] [US3] Write `MobileNav.test.tsx` (opens on button, focus trap, Escape closes, focus returns, links close the panel) under `DS/src/layout/MobileNav/`
- [ ] T053 [P] [US3] Write `Footer.test.tsx` (`contentinfo`, columns as lists with headings, contact items LTR-isolated, back-to-top button) and `PageHero.test.tsx`, `WhatsAppFloat.test.tsx` under `DS/src/layout/`

### Implementation

- [ ] T054 [US3] Design mobile/tablet header + drawer states as stories first (`Header.stories.tsx` 360/768/1024 viewports) and record client review in `specs/001-design-system/reviews/mobile-nav.md`
- [ ] T055 [US3] Implement `UtilityBar` + stories; Figma top row of `411:3807`
- [ ] T056 [US3] Implement `Header` (server shell; `theme` hero/solid; nav links default/active from `64:27`) + stories; Figma `2:3`, `411:3807`
- [ ] T057 [US3] Implement `MobileNav` (client, Radix Dialog, side sheet from inline-end, includes CTA and language toggle) + stories
- [ ] T058 [US3] Implement `Footer` (logo, description, socials IconButtons, 3 link columns, contact items, legal rows, back-to-top client leaf with reduced-motion aware scrolling, giant wordmark SVG from Figma `407:85` exported to `DS/assets/brand/wordmark.svg`) + stories; Figma `407:85`, `411:3881`
- [ ] T059 [P] [US3] Implement `PageHero` (dark photo with navy overlay, title, subtitle, optional breadcrumbs/action) + stories; Figma hero of `445:36452`, `448:41873`
- [ ] T060 [P] [US3] Implement `WhatsAppFloat` (fixed bottom inline-end, safe-area inset) + stories; Figma `226:10011`

**Checkpoint**: V3 passes.

---

## Phase 6: User Story 4 — Content components & sections (P2)

**Goal**: every section in contracts/components.md "Sections".

**Independent Test**: quickstart V4.

### 6a. Homepage sections (needed by US5)

- [ ] T061 [P] [US4] Write tests for `SectionHeading`, `Statement`, `HomeHero`, `GapSection` under `DS/src/sections/`
- [ ] T062 [P] [US4] Write tests for `LogoMarquee` (pause/play button `aria-pressed`, paused under reduced motion, duplicated track `aria-hidden`, logos named once), `CredentialsGrid` (placeholders hidden unless `showPlaceholders`) under `DS/src/sections/`
- [ ] T063 [P] [US4] Write tests for `ServiceTabs` (tablist semantics, arrow keys respect RTL/LTR, panel content swaps), `PillarCard`, `ReasonsSection`, `StatTile`/`StatsStrip` (list semantics, locale formatting) under `DS/src/sections/`
- [ ] T064 [P] [US4] Write tests for `ProcessSteps`, `PhotoQuoteBand`, `NewsCard`, `NewsGrid`, `Testimonial` under `DS/src/sections/`
- [ ] T065 [P] [US4] Write tests for `Estimator` (state machine from data-model: next/back/validation error announced/result/restart, optional quote form → submit success/error, progress text and `progressbar` values, currency formatting) and `EstimatorSection` under `DS/src/sections/Estimator/`
- [ ] T066 [US4] Implement `SectionHeading` (light/dark, eyebrow, accent gradient line, description, action, `split` layout) + stories; Figma `530:4339`, `411:3827`
- [ ] T067 [US4] Implement `Statement` + stories; Figma `411:3796`
- [ ] T068 [US4] Implement `HomeHero` (hero tone + flow-lines + dots grid, masked portrait image, two actions) + stories; Figma `411:3700`–`411:3711`, `411:3702`
- [ ] T069 [US4] Implement `GapSection` (statement + two masked images + eyebrow/body) + stories; Figma `411:3788`
- [ ] T070 [US4] Implement `LogoMarquee` (client; CSS keyframes, two rows opposite directions, edge fade, pause control) + stories; Figma `569:5848`
- [ ] T071 [US4] Implement `CredentialsGrid` (dark, logo cells, placeholder cells) + stories; Figma `585:6030`, `561:1235`
- [ ] T072 [US4] Implement `ServiceTabs` (client, Radix Tabs vertical, large tab labels, image with floating stat card, link CTA) + stories; Figma `411:3712`, `425:2`
- [ ] T073 [P] [US4] Implement `PillarCard` (dark/light, sm/wide) + stories; Figma `411:3745`, `411:3759`, `411:3738`
- [ ] T074 [P] [US4] Implement `StatTile` and `StatsStrip` (dividers, light/dark) + stories; Figma `411:3772`, `530:4369`
- [ ] T075 [US4] Implement `ReasonsSection` composing SectionHeading, PillarCard, image, StatsStrip + stories; Figma `411:3728`
- [ ] T076 [P] [US4] Implement `ProcessSteps` (4 bordered cards, index numerals) + stories; Figma `411:3825`, `530:4391`
- [ ] T077 [P] [US4] Implement `PhotoQuoteBand` (image half + inverse panel with logo-mark pattern) + stories; Figma `411:3846`
- [ ] T078 [P] [US4] Implement `NewsCard` and `NewsGrid` (with optional FilterChipGroup and Pagination slots) + stories; Figma `423:1145`, `426:29895`
- [ ] T079 [P] [US4] Implement `Testimonial` + stories; Figma `411:3871`–`411:3880`
- [ ] T080 [US4] Implement `Estimator` (client; dark card, progress, dark TextInput currency mode, next/back, result step and optional "request a formal quote" form step designed in same language, disclaimer) and `EstimatorSection` + stories with mock config; Figma `411:3854`, `411:3855`

### 6b. Other approved pages' sections

- [ ] T081 [P] [US4] Write tests for `ServiceCard`, `SlideCounter` integration, `CtaCards`, `FaqAccordion` (Radix: Enter/Space toggles, `aria-expanded`, plus/minus icon) , `MethodologyList` under `DS/src/sections/`
- [ ] T082 [P] [US4] Write tests for `FeaturedNews`, `ArticleCardCompact`, `RelatedCarousel` (prev/next buttons disabled at ends, scroll-snap, counter), `ArticleHeader`, `ArticleBody` (heading ids, blockquote/figure styles), `TableOfContents` (active item via IntersectionObserver mock, activation focuses section), `AuthorCard`, `ShareBox` (copy success/failure messages announced) under `DS/src/sections/`
- [ ] T083 [P] [US4] Write tests for `JobRow`, `JobSummaryCard` (description list semantics), `PerkTile`, `TimelineStepper`, `ApplicationFormLayout` under `DS/src/sections/`
- [ ] T084 [P] [US4] Write tests for `ContactItem` (tel/mailto/wa links, hours without link), `OfficeCard`, `OfficeMap` (pins as labelled list, map image decorative), `ContactFormLayout` under `DS/src/sections/`
- [ ] T085 [P] [US4] Write tests for `SectorIndex`, `CaseStoryCard`/`CaseStories`, `LegalDocument` (summary list, numbered sections, TOC, question card with download link) under `DS/src/sections/`
- [ ] T086 [P] [US4] Implement `ServiceCard` + stories; Figma Services list on `448:41066`
- [ ] T087 [P] [US4] Implement `MethodologyList` + stories; Figma "منهجيتنا" block on `448:41873`
- [ ] T088 [P] [US4] Implement `CtaCards` + stories; Figma `473:36122`, `473:36200`
- [ ] T089 [P] [US4] Implement `FaqAccordion` (client, Radix Accordion) + stories; Figma `463:1158`
- [ ] T090 [P] [US4] Implement `FeaturedNews` and `ArticleCardCompact` + stories; Figma featured block on `473:36031`, `501:1155`
- [ ] T091 [US4] Implement `RelatedCarousel` (client, CSS scroll-snap, slider nav IconButtons, SlideCounter) + stories; Figma related articles on `506:2706`, `529:4427`
- [ ] T092 [P] [US4] Implement `ArticleHeader`, `AuthorCard` + stories; Figma `506:2706`
- [ ] T093 [US4] Implement `ArticleBody` (`.ds-prose` styles in `DS/src/styles/base.css`: h2/h3 numbering style, lists with green bullets, pull quote dark card, figure + caption, tags row) + stories; Figma `506:2706`
- [ ] T094 [US4] Implement `TableOfContents` (client, sticky, active indicator on inline-start border) + stories; Figma `506:2706`, `525:3854`
- [ ] T095 [P] [US4] Implement `ShareBox` (client copy; dark sidebar and light inline variants) + stories; Figma `506:2706`, `514:3194`
- [ ] T096 [P] [US4] Implement `JobRow` and `JobSummaryCard` + stories; Figma `512:1159`, job summary on `514:3194`
- [ ] T097 [P] [US4] Implement `PerkTile` and `TimelineStepper` (horizontal ≥ md, vertical < md) + stories; Figma `529:4296`, hiring steps on `519:38941`
- [ ] T098 [P] [US4] Implement `ApplicationFormLayout` and `ContactFormLayout` (compose forms) + stories; Figma apply form on `514:3194`, form on `524:3651`
- [ ] T099 [P] [US4] Implement `ContactItem`, `OfficeCard`, `OfficeMap` (static SVG map illustration exported from `524:3651`, pins positioned by `coordinates`) + stories; Figma `527:5423`, `529:4280`, `578:1293`
- [ ] T100 [P] [US4] Implement `SectorIndex` + stories; Figma "دليل القطاعات" block on `547:4555`
- [ ] T101 [P] [US4] Implement `CaseStoryCard` and `CaseStories` + stories; Figma case stories on `547:4555`
- [ ] T102 [US4] Implement `LegalDocument` (TOC sidebar, "have a question" dark card with PDF download, updated-at pill, summary box, numbered sections) + stories; Figma `525:3854`, `525:4136`

**Checkpoint**: V4 passes.

---

## Phase 7: User Story 5 — Reference homepage proves parity (P2)

**Goal**: `/[lang]/reference/home` built only from library components with mock AR/EN content.

**Independent Test**: quickstart V5 + V6.

- [ ] T103 [P] [US5] Write Playwright spec `e2e/specs/design-system/reference-home.spec.ts`: 404 without `ENABLE_REFERENCE_PAGES`; screenshots 320/360/768/1024/1512/1920 × ar/en (`toHaveScreenshot`); `@axe-core/playwright` 0 serious/critical; keyboard pass through header, service tabs, marquee pause and the full estimator flow; no horizontal overflow; add `design-system` project in `playwright.config.ts`
- [ ] T104 [P] [US5] Create mock content `WEB/src/reference/home.ar.ts` (copy from Figma `411:169`) and `WEB/src/reference/home.en.ts` (provisional English) typed with `@repo/design-system/types`; delete `WEB/src/reference/.keep.ts`
- [ ] T105 [P] [US5] Add neutral, licence-free placeholder photos sized as in Figma to `WEB/public/reference/` with `README.md` noting sources/licences (no Figma watermarked images)
- [ ] T106 [US5] Implement `WEB/app/[lang]/reference/home/page.tsx` composing Header, HomeHero, GapSection, LogoMarquee, ServiceTabs, ReasonsSection, CredentialsGrid, ProcessSteps, PhotoQuoteBand, NewsGrid, EstimatorSection, Footer in Figma order; `notFound()` unless `process.env.ENABLE_REFERENCE_PAGES === 'true'`; `metadata.robots = { index: false, follow: false }`; excluded from `WEB/app/sitemap.ts`
- [ ] T107 [US5] Implement `e2e/visual/figma-diff.mjs` (reads Figma export PNG of `411:169` at 1512 saved to `e2e/visual/figma/home-1512.png`, captures the page, masks photo regions, writes diff + stats to `e2e/visual/out/`) and document in quickstart
- [ ] T108 [US5] Fix parity deltas until V5 passes; record remaining intentional deviations in `specs/001-design-system/reviews/home-parity.md`
- [ ] T109 [US5] Run Lighthouse mobile on `pnpm --filter @repo/web build && start` for both locales; record scores in `specs/001-design-system/reviews/performance.md`; fix until SC-005 targets are met

**Checkpoint**: V5 and V6 pass.

---

## Phase 8: User Story 6 — Workbench documentation (P3)

**Goal**: Storybook is the team's reference.

**Independent Test**: quickstart V7.

- [ ] T110 [P] [US6] Write `DS/src/docs/Introduction.mdx` (purpose, Figma links, approved pages table, how to use tokens/components)
- [ ] T111 [P] [US6] Write `DS/src/docs/Bidi-Rules.mdx` (logical utilities, mirroring, LTR isolation for numbers/emails, locale formatting)
- [ ] T112 [P] [US6] Write `DS/src/docs/Accessibility.mdx` (contrast overrides table R4, motion policy, keyboard patterns per component)
- [ ] T113 [P] [US6] Write `DS/README.md` (install, `styles.css` import, font setup in Next, scripts, contribution checklist mirroring task conventions)
- [ ] T114 [US6] Add `DS/src/__guards__/stories-coverage.test.ts` asserting every exported component has a `*.stories.tsx` with `parameters.design.url`

**Checkpoint**: V7 passes.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T115 Raise coverage to ≥ 90% lines for `DS/src` (`pnpm --filter @repo/design-system test -- --coverage`)
- [ ] T116 [P] Verify client JS budget: build `WEB`, inspect reference page bundles, keep library client JS ≤ 35 kB gzip; record in `reviews/performance.md`
- [ ] T117 [P] Collect client/designer sign-offs listed in plan.md (contrast overrides, mobile nav, estimator result, imagery) in `specs/001-design-system/reviews/signoffs.md`
- [ ] T118 Run full quickstart V1–V7, `pnpm lint`, `pnpm check-types`, `pnpm test`, `pnpm build`; open PR `001-design-system` → `main` with screenshots, axe results, figma-diff output, and shared-file changes called out

---

## Dependencies & Execution Order

### Phase dependencies

- Setup (P1) → Foundational (P2) → US1 (P3 phase) → US2 → US3 → US4 → US5 → US6 → Polish.
- US1 blocks everything (tokens). US2 blocks US3/US4 (primitives). US3 and US4 can run in parallel after US2.
- US5 depends on US3 + homepage subset of US4 (6a, T061–T080); 6b (T081–T102) can proceed in parallel with US5.
- US6 can start any time after US2; T114 needs all components.

### Within each story

- Test task(s) before implementation; tests MUST fail first.
- Figma context → tokens mapping → implementation → stories → screenshot comparison.

### Parallel opportunities

- Setup: T003–T006.
- Foundational: T012–T015, T017–T018.
- US2: all test-writing tasks T036–T042 in parallel; implementations T045–T047 in parallel.
- US4: test tasks T061–T065 and T081–T085 in parallel; implementations marked [P] touch separate folders.

## Parallel Example: User Story 4 (6b)

```text
T086 ServiceCard   | T087 MethodologyList | T088 CtaCards | T089 FaqAccordion
T090 FeaturedNews  | T092 ArticleHeader   | T095 ShareBox | T096 JobRow
T097 PerkTile      | T099 ContactItem     | T100 SectorIndex | T101 CaseStories
```

## Implementation Strategy

### MVP first

1. Phases 1–2, then US1 (tokens) → review V1 with the owner.
2. US2 + US3 → client reviews chrome and mobile nav in Storybook.
3. US4 6a + US5 → reference homepage parity review (main client milestone).
4. US4 6b + US6 + Polish → PR.

### Review checkpoints (Claude + owner)

After US1, after US3 (mobile nav sign-off), after US5 (parity), and final PR.

## Notes

- `[P]` = different files, no dependency on incomplete tasks.
- Do not edit `packages/shared`, `apps/api`, `apps/admin` (owned by the 002 backend run); request needed type changes in the PR.
- Commit after each task or logical group using Conventional Commits (`feat(design-system): …`, `test(design-system): …`).
