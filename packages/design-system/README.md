# @repo/design-system

Bilingual (Arabic RTL default, English LTR) component library for the AA-CPA public website. Tokens come from the approved
Figma file (`1jzfujyx2OJ6EKDRD2X6Xm`, page "Page 1"). Documentation and every component variant live in Storybook.

## Install

Internal workspace package; no publishing.

```jsonc
// apps/web/package.json
{ "dependencies": { "@repo/design-system": "workspace:*" } }
```

```ts
// apps/web/next.config.ts
const nextConfig = { transpilePackages: ['@repo/design-system'] };
```

## Styles

The library does not import Tailwind itself; the app does. In the app's global stylesheet:

```css
@import 'tailwindcss';
@import '@repo/design-system/styles.css';
```

`styles.css` brings the Figma tokens (`@theme static`), the theme (breakpoints, fluid type, section spacing, motion) and base
styles, and registers the package for class scanning (`@source`).

## Fonts

Almarai (SIL OFL, `assets/fonts/OFL.txt`) is shipped as woff2 in `assets/fonts/` (weights 300/400/700/800, Arabic and Latin
files). Apps load it themselves:

- **Next.js**: `next/font/local` with the files from `packages/design-system/assets/fonts/`, one family per script
  (Latin first, Arabic as fallback), exposing `--font-almarai`. See `apps/web/app/[lang]/layout.tsx`.
- **Storybook**: `assets/fonts/almarai.css` (`@font-face` with `unicode-range`), imported by `.storybook/preview.tsx`.

## Imports

```ts
import { Section, Container } from '@repo/design-system/layout';
import type { NavItem } from '@repo/design-system/types';
```

Entry points: `./styles.css`, `./primitives`, `./forms`, `./layout`, `./sections`, `./icons`, `./lib`, `./types`.
Components are server-renderable unless marked client in `specs/001-design-system/contracts/components.md`.

## Scripts

| Command (run from the repo root) | What it does |
| --- | --- |
| `pnpm --filter @repo/design-system test` | Vitest: unit, a11y (`axe`), guard and token tests |
| `pnpm --filter @repo/design-system test -- --coverage` | Same, with v8 coverage over `src/**` |
| `pnpm --filter @repo/design-system check-types` | `tsc --noEmit` |
| `pnpm --filter @repo/design-system lint` | ESLint with `jsx-a11y` |
| `pnpm --filter @repo/design-system tokens` | Regenerate `src/styles/tokens.css` and `src/lib/tokens.ts` from `tokens/figma-variables.json` |
| `pnpm --filter @repo/design-system storybook` | Storybook dev server on port 6006 |
| `pnpm --filter @repo/design-system build-storybook` | Static Storybook in `storybook-static/` (CI artifact, not committed) |

## Changing a token

1. Edit `tokens/figma-variables.json` (keep `figmaValue`, `a11yOverride` and `reason` for any contrast override).
2. Run `pnpm --filter @repo/design-system tokens` and commit the generated files with the JSON.
3. Run the tests: the Figma-snapshot guard and the contrast test must pass.

## Contribution checklist (every component)

- Folder `src/<group>/<Component>/` with `<Component>.tsx`, `.stories.tsx`, `.test.tsx`, `index.ts`; re-export from the group's `index.ts`.
- Tests written first: render, every variant, RTL and LTR, keyboard for interactive parts, `axe` with no violations.
- JSDoc `@figma <node-id>`; the story has `parameters.design.url` pointing at that Figma node.
- Stories cover every variant and state, in AR and EN (locale toolbar), with long-text and missing-optional cases.
- Token classes only; logical utilities only; no hex or px literals outside `tokens/` and `src/styles`. The guard tests enforce it.
- `"use client"` only for components listed as client in the contracts.
- Never implement frames outside Figma "Page 1", or the "Sectors — Redesign" frame (`552:4605`).
- Run `test`, `check-types`, `lint` and `build-storybook` before opening a PR.

## More

`specs/001-design-system/` — spec, plan, research, data model, component contracts, quickstart, tasks.
