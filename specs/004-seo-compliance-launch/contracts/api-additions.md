# API & schema additions (004)

**Feature**: `004-seo-compliance-launch` — extends 002's contracts; same conventions (Zod in `@repo/shared`, endpoints
in `endpoint.ts`, admin routes permission-gated).

## Shared schemas (`packages/shared/src/validations/`)

| File | Exports |
| --- | --- |
| `redirect.schema.ts` (new) | `RedirectFormSchema`, `RedirectAdminSchema`, `RedirectImportRowSchema`, `RedirectMapWebSchema` (`Record<fromPath, { to; type }>`) |
| `seo.schema.ts` (changed) | per-page/entity `ogImage`, `noindex`; `GlobalSeoSchema.organization`, `consentVersion`, `gtmId`, `gaMeasurementId`, `metaPixelId` |
| `common.schema.ts` (changed) | `ImageFieldSchema.license` (optional) |
| `dashboard.schema.ts` (changed) | `LeadStatsQuerySchema { from; to }`, `LeadStatsSchema { bySource; byService; byPath; estimatorCompletions: { date; count }[] }` |

## Public endpoints

| Method & path | Response | Notes |
| --- | --- | --- |
| GET `/api/redirects/map` | `RedirectMapWebSchema` | cached; web proxy tag `redirects`; ≤ 5,000 entries |
| GET `/api/og?type={page\|service\|article\|job}&key={pageKey\|slug}&lang={ar\|en}` | `image/png` 1200×630 | cached by content hash; `Cache-Control: public, max-age=31536000, immutable` with hash in `ETag` |
| GET `/api/site/seo-global` | existing + `organization`, `consentVersion`, tracking ids | |

## Admin endpoints

| Method & path | Permission | Notes |
| --- | --- | --- |
| CRUD `/api/admin/redirects` (+ `PATCH reorder` not needed) | `admin_portal.seo.update` (new) | chain resolution and loop rejection on save |
| POST `/api/admin/redirects/import` (CSV) | `admin_portal.seo.update` | all-or-nothing, returns row errors |
| GET `/api/admin/redirects/export.csv` | `admin_portal.seo.view` (new) | |
| GET `/api/dashboard/lead-stats?from=&to=` | `admin_portal.leads.view` | |

## Data changes

- `ContactRequest.landingPath` already exists from 002 (no change here).
- `Redirect` table (data-model.md); 002 `SlugRedirect` rows migrated into `Redirect` with `source = slug_change`, then
  `SlugRedirect` dropped; slug changes write `Redirect` rows.

## Web consumers (003 area, 004 tasks)

- `apps/web/proxy.ts` consults the redirect map before locale negotiation.
- `buildMetadata` uses `/api/og` when no `ogImage` is set.
- Consent banner reads `consentVersion`; GTM loader reads `gtmId`.
