# Implementation Gaps

> Audit date: 2026-09-02
> Audited against: `IMPLEMENTATION_PLAN.md`
> Overall completion: ~85–90%

---

## API — `apps/api` (~90% done)

### 1. `src/unites/` — Module not implemented
- Directory exists with empty `helpers/` and `services/` subdirs.
- Missing: `unites.module.ts`, `unites.controller.ts`, and CRUD services (create, update, delete, getAll, getById).
- Prisma models `Unit` and `UnitTranslation` already exist in `schema.prisma`.
- Follow the same single-action service pattern used in `src/project/services/`.
- Register `UnitesModule` in `app.module.ts`.

### 2. `src/resource/` — Module not implemented
- Directory exists but is empty.
- Missing: S3 upload service (using `@aws-sdk/client-s3`) and Sharp image processing.
- Port from `ramy-morshedy/apps/api/src/resource/`.
- Register `ResourceModule` in `app.module.ts`.

---

## Admin — `apps/admin` (~80% done)

### 3. Projects CRUD incomplete
- `src/routes/_authenticated/projects/index.tsx` is read-only (card list only).
- `src/features/projects/components/` and `src/features/projects/types/` are empty directories.
- Missing: create/edit/delete dialogs with EN/AR translation support.
- Should match the pattern used in `src/features/users/`.

### 4. Site-Settings feature missing
- `src/features/site-settings/` is empty.
- Sidebar links to `/settings`, `/settings/social`, `/settings/seo` lead to 404.
- Needs routes + feature components for managing CMS sections/SEO.

### 5. Demo features still present — should be removed
- `src/routes/_authenticated/apps/` + `src/features/apps/`
- `src/routes/_authenticated/tasks/` + `src/features/tasks/`
- Also remove corresponding entries from `src/components/layout/data/sidebar-data.ts`.

### 6. Local schema duplicates — should use `@repo/shared`
- `src/features/auth/user-auth-form.tsx` — local `formSchema` instead of shared `LoginSchema`.
- `src/features/users/data/schema.ts` — local `userSchema`/`createUserSchema` instead of shared schemas.
- `src/features/inquiries/data/schema.ts` — local `inquirySchema` instead of shared model.
- `src/routes/_authenticated/projects/index.tsx` — local `ProjectItem`/`ProjectsResponse` interfaces instead of shared `ProjectModel`.

### 7. `PermissionEnum` not wired to UI gating
- Imported in `src/types/auth.ts` but not used in `sidebar-data.ts` or route guards.
- Sidebar nav items and authenticated routes should check user permissions.

### 8. ESLint config file missing
- `apps/admin/package.json` has ESLint 9 deps and `"lint": "eslint ."` but no `eslint.config.js`.

---

## Web — `apps/web` (~60% done)

### 9. `src/` directories are empty placeholders
All of these directories exist but contain no files:
- `src/animations/`
- `src/assets/styles/`
- `src/components/ui/`
- `src/hooks/`
- `src/store/`
- `src/types/`
- `src/utilities/`

Port from `ramy-morshedy/apps/web/src/`.

### 10. `dictionaries/` is empty
- Directory exists at `apps/web/dictionaries/` but has no `en.json` / `ar.json`.
- Port from `ramy-morshedy/apps/web/dictionaries/`.

### 11. `public/` has no assets
- Directory exists but is empty (no images, icons, or static files).

### 12. `@repo/ui` not imported
- Listed in `package.json` as `workspace:*` dependency but not imported anywhere in code.
- Either import components from `@repo/ui` or remove the dependency.

### 13. ESLint config missing
- No `eslint.config.mjs` in `apps/web/`.

### 14. i18n locale mismatch
- `app/[lang]/layout.tsx` validates against `['en', 'gr']`.
- Plan and `@repo/shared` use `EN`/`AR` (English/Arabic), not `EN`/`GR`.
- Prisma `Language` enum also uses `en`/`gr` — should be `en`/`ar` if Arabic is intended.
