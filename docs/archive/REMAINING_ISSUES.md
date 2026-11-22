# Remaining Issues

> Written after implementing `IMPLEMENTATION_GAPS.md`. Three follow-up passes then resolved the
> PowerShell/Rollup blocker, the database migration, and everything else that didn't need a
> scoping decision. What's left below is either a scoping decision for you, or genuinely out of
> reach from this environment.

**Resolved since the first pass:**
- The Rollup/pnpm-store blocker — you ran `pnpm install` + builds in PowerShell; `@repo/shared`'s
  dist now has the real `{ en, ar }` shape, and `apps/api` (nest build), `apps/admin` (vite
  build), and `apps/web` (next build) all produced real build output. Confirmed by checking
  `apps/admin/dist/`, `apps/api/dist/`, `apps/web/.next/` directly.
- `pnpm --filter @repo/ui lint` — was failing with "No files matching the pattern
  'src/**/*.ts'" even after the install. Cause: `packages/ui`'s and `packages/shared`'s
  `"lint"` scripts used single-quoted globs (`eslint 'src/**/*.ts'`), which bash strips but
  Windows' cmd.exe (what pnpm scripts run through) passes through literally — ESLint received
  the literal string `'src/**/*.ts'`, quote marks included, which matches nothing. It also only
  matched `.ts`, not `.tsx` (missing `packages/ui/src/index.tsx` even on a shell where quoting
  worked). Fixed both to `"eslint ."`, matching `apps/admin`'s already-correct script. Verified:
  `packages/ui` → 2 pre-existing warnings, 0 errors; `packages/shared` → 5 pre-existing
  warnings, 0 errors.
- `apps/api`, `apps/admin`, `apps/web` all fully `tsc --noEmit` clean, zero errors anywhere
  (the 2 pre-existing admin errors this used to note are now fixed — see below).
- eslint configs for `apps/api`, `packages/shared`, `packages/ui` (added in the prior pass) —
  all now resolve and lint clean.
- `src/lib/file-validation.ts` (admin) — real type bug, fixed.
- `src/lib/api-error-handler.ts` (admin) — deleted; dead code importing a class (`ApiError`)
  that never existed in this app's axios-based API client.
- **Database migrated and in sync.** `prisma migrate dev` initially failed with drift:
  your database already had 6 `monitoring_*` tables (created via `prisma db push` at some
  earlier point, which never records migration history) that no migration file accounted for.
  I hand-wrote a migration matching the live table structure from `schema.prisma` and you ran
  `prisma migrate resolve --applied` on it (marks it done without re-running its SQL, since the
  tables already existed — no data touched), then `prisma migrate dev` applied the real pending
  migration (`en/gr` → `en/ar`) cleanly. Your database is now fully in sync with the schema.
  Migration history: `20260604144743_init` → `20260604144744_add_monitoring_tables` (resolved,
  not executed) → `20260902000000_language_gr_to_ar` (applied).

- **GSAP scroll/page-transition animations (`src/animations/`) ported.** Core infra
  (`gsap.ts` plugin registration, `Animations.tsx` orchestrator, `PageTransition.tsx`,
  `Preloader.tsx`/`PreloaderWrapper.tsx`, `useAppReady`, `useTransitionStore`) plus all 7
  reusable `common/` primitives (fade-in, fade-up, image, line, word × 4 variants, counter) and
  the 3 page animations that map to pages we actually have (`headerAnimation`,
  `footerAnimation`, `homePageAnimation`) — wired into `app/[lang]/layout.tsx`
  (Preloader + PageTransition) and the home page (`<Animations animations={[...]}>` with
  `animate-line`/`animate-fade-up` classes on its content). `CustomHeader`/`CustomFooter` got
  the `#main-header`/`#main-footer-id`/`.logo`/`.footer-desc` hooks these animations target.
  **Not ported:** the 7 page-specific animation files for pages that don't exist yet (About,
  Community, Investor Relations, Media, Contact, Projects listing, Project/Unit details — see
  §1) — porting an animation for a page that isn't built would just be dead code.
  `homePageAnimation.ts` itself will similarly no-op until `#home-about-section-id` markup
  exists (ramy's richer `HomeAbout` section, not built here). Swapped ramy's `hamo` dependency
  for a small local `useWindowSize` hook (avoids a pre-release npm package for one hook) and
  replaced its `/images/logo-2.png` references with the existing text `Logo`, since
  `public/` has no image assets (§3).
  **Needs `pnpm install`:** added `gsap` and `@gsap/react` to `apps/web/package.json` — not
  installed yet in this environment, so `apps/web`'s `tsc --noEmit` currently shows 14 "cannot
  find module 'gsap'" cascade errors (all in `src/animations/`, all downstream of the missing
  package — confirmed nothing else in the app regressed). Run `pnpm install` and they'll
  resolve; then check the transition/preloader visually in a browser — I can't render one from
  here, and `PageTransition.tsx` in particular (route-transition on every link click) is worth
  a look before you trust it in production.

- **The two disconnected demo auth pages are fixed and wired to the real API.**
  `sign-in/components/user-auth-form.tsx` (the "Sign In (2 Col)" variant) was calling
  `response.accessToken`/`response.refreshToken`/`auth.setRefreshToken()`, none of which exist
  on the real `LoginResponse`/`AuthStore` — fixed to use the actual `{token, user}` shape and
  the shared `LoginSchema`, and its error handler now surfaces the backend's actual message
  instead of Axios's generic one. The password-reset flow (`/forgot-password` → `/otp` →
  `/reset-password`) is now a real 3-step flow carrying `email`/`otp` forward via URL query
  params: Forgot Password now navigates to `/otp?email=...` on success instead of dead-ending;
  OTP was 100% fake (a stub `showSubmittedData` call, no API) and now calls the real
  `canResetPassword({email, otp})` endpoint before advancing to
  `/reset-password?email=...&otp=...`; Reset Password now uses the actual `ResetPasswordSchema`
  (`email`, `otp`, `newPassword`, `passwordConfirmation`) instead of a nonexistent
  `resetPassword(token, password)` call, and auto-logs the user in with the fresh token the
  reset endpoint returns. Also fixed a real backend bug found while wiring this: the
  password-reset email's link pointed to `/auth/reset-password`, which matches no route
  (TanStack's `(auth)` route group is stripped from the URL — the real path is
  `/reset-password`). Along the way, fixed two pre-existing `as any` casts in `auth-api.ts`
  (`premissions` is now typed `PermissionEnum[]`, not cast from `string[]`). `tsc --noEmit` and
  `eslint` both clean on `apps/admin` and `apps/api`.

- **Hardcoded credential in the seed script removed.** `apps/api/prisma/seed.ts` no longer
  bakes in `info@mokhtarali.com` / `<redacted>`. It now reads `SUPER_ADMIN_EMAIL`,
  `SUPER_ADMIN_USERNAME`, `SUPER_ADMIN_FULL_NAME` (sensible defaults) and
  `SUPER_ADMIN_PASSWORD` (**required** — the script throws if it's unset, and validates it
  against the same `passwordValidation` rules the API enforces everywhere else). Added to
  `.env.example` (blank password, template only) and to your local `.env` (git-ignored) with a
  real dev credential: `admin@example.com` / `<redacted>` — change it. **If you already ran
  `prisma db seed` with the old hardcoded email**, that `info@mokhtarali.com` user still exists
  in your database — this change doesn't delete it, future seed runs just create/look for
  `admin@example.com` instead; deactivate or delete the old one manually if you don't want it.
  Also fixed a related pre-existing gap while verifying this: `prisma/seed.ts` was never
  actually coverable by `apps/api`'s ESLint config (it sits outside `tsconfig.json`'s
  `src`-only `include`, so typed-lint rules crashed trying to parse it) — added a scoped
  override in `eslint.config.mjs` for `prisma/**/*.ts` that falls back to untyped parsing
  there, and declared the four new env vars in root `turbo.json` so Turbo's caching accounts
  for them. `tsc --noEmit` and `eslint` both clean.

**Still to do, at your convenience (not blocking):**
```powershell
npx prisma db seed
```
Creates the super-admin user and default CMS sections using the credential above.

---

## 1. Web app: minimal scaffold only, not a full port

Per your explicit choice mid-session, `apps/web` got a **minimal functional scaffold** — API
client (`@repo/ui`), `useQuery`/`useMutation` hooks, store, types, a Header/Footer/Button, GSAP
scroll/transition animations (see above), and the home + project-detail pages wired to the live
API — not a full port of `ramy-morshedy/apps/web/src/` (~150 files: ~30 icon components, the
full project/unit-detail component tree, About/Community/Investor-Relations/Media/Contact
pages).

**Still missing if you want full parity with ramy:**
- `app/[lang]/about`, `/community`, `/investor-relations`, `/media`, `/contact` — no pages exist
  for these yet (only `/` and `/[slug]` do). Their animation files aren't ported either (see
  above).
- Unit detail pages/components (`UnitDetails`, `UnitDetailsGalleryHero`, booking modals, etc.).
- The full icon set and richer header (mega-menu, mobile drawer) — the current header is a
  simple top nav with 3 links.

This is a genuinely large follow-up (treat it as its own task, not a quick fix).

---

## 2. Admin: two remaining feature gaps

- **Projects dialog doesn't expose tags/amenities editing.** `ProjectFormModel` has two
  repeating-array fields — `tags: MultiLanguageFieldModel[]` and
  `amenities: { icon, title, description }[]` — needing an "add/remove row" UI per language.
  The dialog **preserves** existing values on edit (round-trips them unchanged) but doesn't let
  a user add, remove, or edit them.
- **No UI for managing Units within a Project.** The `unites` API module (full CRUD) is
  implemented and correct, but there's no admin screen to create/edit/delete units — only the
  Projects list/dialogs exist. Would follow the same provider/dialogs pattern as
  `features/projects/`, likely nested under a project's detail view.

**Resolved:** real upload widget. Added `src/lib/upload-api.ts` (`POST /api/upload/image` as
`FormData`, with upload-progress reporting) and `src/components/upload/image-upload-field.tsx`
(click-or-drag dropzone, client-side validated via the existing `validateImageFile`, image
preview with change/remove on hover). Wired into the Projects dialog's "Thumbnail" field,
replacing the plain URL text input. `tsc --noEmit` and `eslint` both clean.

---

## 3. `public/` directories are still empty

Neither `apps/web/public/` nor a favicon/logo exist. I won't fabricate placeholder brand assets
(logo, OG image, favicon) — that's a design decision for you, not something to invent.
