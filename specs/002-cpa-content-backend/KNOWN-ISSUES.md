# 002 known issues (2026-11-23)

## `pnpm build` and `pnpm start` fail: the legacy `apps/web` pages do not compile

Task T029 deletes the real-estate models (`Project`, `Unit`, `Inquiry`, `Media`, `MediaHero`, `Community`, `InvestorRelation`) from
`@repo/shared`, and the plan says "no changes to `apps/web`". The starter pages in `apps/web` still use them, so the web type-check fails:

```
./app/[lang]/[slug]/page.tsx:3:46  Type error: Module '"@repo/shared"' has no exported member 'ProjectModelWeb'.
```

About 25 errors in 9 files: `[slug]` (project detail), `[slug]/units/[unitSlug]`, `projects`, the home page and `sitemap.ts` (projects and
units); `careers` and `careers/[slug]` (`job.description` is now `summary`); `contact` (`ContactFormSectionModelWeb`, `ContactHeroSectionModelWeb`
and `CareersPageSettingsModelWeb` no longer exist); `news` and `news/[slug]` (thumbnails are now `{ url, width, height, alt }`).

Feature 003 replaces these pages. Until then:

```
pnpm turbo run build --filter=@repo/api --filter=@repo/admin
pnpm turbo run start --filter=@repo/api --filter=@repo/admin
```

The branch `integration/001-002` shows a working resolution (remove the dead routes, move careers and contact to the new models). It also
exports `Localized` from `@repo/shared`, which should be added to 002 properly: it is needed to type the localised models.

## Other

- Line endings: the 002 commit stored 650 files as CRLF. Commit `3fa6677` normalises them to LF and adds `.gitattributes`
  (`* text=auto eol=lf`). Contributors on Windows should run `git add --renormalize .` once after pulling.
- The 002 plan's quickstart gates were not run against the web app (it is out of scope for this feature), which is how the break above went
  unnoticed. CI should build the web app, or the plan should list the legacy pages it breaks.

## Open from the 2026-11-23 analysis

- Scheduled publish (FR-011, Asia/Riyadh): no API task or time-zone test found; confirm the public filter hides future-dated items and add a test.
- SC-005 (spam rejection ≥ 95%) has no instrumentation task; treat it as a post-launch metric.
- `Localized` is exported from `@repo/shared` on `integration/001-002`; make sure it is on the 002 branch before merging to `main`.
