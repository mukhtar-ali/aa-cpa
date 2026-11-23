# 001 Design system: status and what is missing

State on 2026-11-23, branch `001-design-system`. 114 of 118 tasks in `tasks.md` are ticked. The four open ones are listed below with
everything else that is not finished. Nothing here is hidden in the code: each item says what is missing, why, and who can close it.

## Open tasks

| Task | What is missing | Needs |
| --- | --- | --- |
| **T108** Figma parity | 10.8 % of pixels differ against the 5 % gate. What remains is text anti-aliasing, the hero cut-out portrait, the placeholder logo and small offsets (`reviews/home-parity.md`). | Designer decision to accept the floor, or licensed images and the cut-out asset |
| **T109** Lighthouse mobile | Simulated slow-4G LCP is 4 to 6 s against the 2.5 s target (measured LCP is about 1.2 s). Performance 77, accessibility 100, best practices 100, SEO 92. The legacy-font preload change is built but not re-measured. Scores swing widely on a loaded machine. | A re-measure on a quiet machine or in CI after the font change; then decide if SC-005 is judged on lab or field data |
| **T117** Sign-offs | `reviews/signoffs.md` lists four approvals (contrast overrides, mobile layouts and navigation, estimator result and error summary, final imagery). None is collected. | Client or designer |
| **T118** Final gates and PR | Full quickstart V1 to V7, the complete test run, and opening the PR into `main`. The PR text is drafted in `pr-description.md`. | Me, after the items above, and your go-ahead to open the PR |

## Verification that has NOT been done

- **The complete design-system test suite has not been re-run since the second review batch** (commit `64df452`). The last full run was
  87 of 89 files green with two guard tests that timed out on a slow disk (limits raised since, and the guards pass when run alone). After the
  batch, 53 test files covering everything that changed were run and pass (the three failures they showed were tests expecting the old
  behaviour, now updated). The machine's disk was too slow to finish a full run (loading `jsdom` took more than 80 seconds, over vitest's
  fixed 90 second worker start limit). CI will give the real answer.
- **Coverage** was measured per directory and merged: 94.7 % of lines at that time. Not re-measured after the later changes.
- **Lighthouse and the Figma diff** were last run before the final component changes (the diff was re-run after most layout changes: 10.8 %).
- **Not run at all:** the mobile layouts at 360 and 768 px against any design (none exists), Storybook build in CI, Playwright against the final
  build.

## Not built or not verified against Figma

Layouts inferred because the Figma frame could not be read or has no frame: `FeaturedNews`, `TimelineStepper`, `ContactItem`, `OfficeMap`
(pins and map image), contact form (`524:3651`), application form (`514:3194`), dark `CtaCard`, header height and active-link style, sector
row typography (partly). Section radius is 30 px in Figma (task text said 32). `layout/content-width-wide` (1320 px) is an assumption.

## Decisions waiting for the client or designer

1. Contrast overrides (seven token colours changed from the Figma values to reach WCAG AA; `figmaValue` and the reason are kept in the JSON).
2. Mobile and tablet layouts and the mobile navigation (Figma is desktop only).
3. Estimator result step and form error summary (team designed).
4. Button `paper` variant replaces the contract's `outline-light`; medium button is 48 px, not 44.
5. Imagery: hero portrait, photos and logos are placeholders.

## Deferred review items

All 56 findings of the four targeted reviews are in `reviews/review-backlog.md` with their status. The two debate-review lanes covered only
part of the diff (the second reviewer's lane, `agy`, hung on start-up in this environment until its version check was allowed to finish). The
accepted items: `proxy.ts` now defaults to Arabic (call it out in the PR), and the legacy layout still fetches SEO, site info and header
projects on reference pages (feature 003 removes the legacy chrome).

## Merging with 002

- `002-cpa-content-backend` deletes the real-estate models (`Project`, `Unit`, `Inquiry`, `Media`...) from `@repo/shared` (its task T029) and its
  plan says "no changes to `apps/web`". The legacy starter pages in `apps/web` still import them, so **`pnpm build` and `pnpm start` fail on
  002 alone** (`Module '@repo/shared' has no exported member 'ProjectModelWeb'`, about 25 type errors in 9 files). Feature 003 replaces those
  pages. Until then, run `pnpm turbo run start --filter=@repo/api --filter=@repo/admin`.
- Branch `integration/001-002` (merge of both plus the web fixes) builds all five tasks. The web fixes there: remove the dead routes
  (`[lang]/[slug]`, `[lang]/projects`), home page and sitemap without projects, careers and contact on the new models, news thumbnails with
  the `{ url }` image shape, and `Localized` exported from `@repo/shared` (that export belongs on 002).
- 002 was committed from a Windows checkout with 650 files as CRLF; commit `3fa6677` on 002 normalises them (`.gitattributes`). After it,
  merging 001 conflicts only in `ci.yml` (keep the design-system steps, drop the `starter-core` job 002 removed) and `pnpm-lock.yaml`
  (regenerate).

## Environment notes for whoever continues

- On this machine reads from `/mnt/e` are very slow when the cache is cold. Vitest has a fixed 90 second worker start limit: run
  `pnpm vitest run --maxWorkers=1 <paths>` and retry; killing idle dev servers helps. A killed `pnpm install` or git process can leave a
  stale zero-byte `.git/index.lock`.
- `agy` as the debate reviewer needs its first call to finish (the relay's version preflight allows 10 seconds; the cold start took 8 to
  60 seconds).
- Do not run `pkill -f <pattern>` from the agent shell: the pattern matches the shell itself and kills it.
