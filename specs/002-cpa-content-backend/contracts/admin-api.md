# Admin API contract (`apps/api`, consumed by `apps/admin`)

**Feature**: `002-cpa-content-backend`

All routes require auth (existing JWT + refresh rotation) and `@ProtectedWithPermissions(...)`. Bodies are
validated with the shared `*FormSchema`; responses use `*AdminSchema` (multi-language `{ ar, en }` values,
`translationStatus`). Lists accept `PaginationParamsSchema` + entity filters; all lists support `q` search on
Arabic and English titles.

## CRUD pattern (per entity)

`GET /api/admin/<entity>` · `GET /api/admin/<entity>/:id` · `POST /api/admin/<entity>` ·
`PUT /api/admin/<entity>/:id` · `DELETE /api/admin/<entity>/:id` (soft) ·
`PATCH /api/admin/<entity>/reorder` body `{ ids: string[] }` · `PATCH /api/admin/<entity>/:id/publish` body
`{ isPublished: boolean; publishedAt?: string }` (enforces Arabic publish guard).

| Entity path | Permission prefix | Form schema |
| --- | --- | --- |
| `services` | `admin_portal.services.*` | `ServiceFormSchema` |
| `sectors` | `admin_portal.sectors.*` | `SectorFormSchema` |
| `news` (Articles; existing paths kept) | `admin_portal.news.*` | `NewsFormSchema` (extended) |
| `article-categories` | `admin_portal.news.*` | `ArticleCategoryFormSchema` |
| `authors` | `admin_portal.news.*` | `AuthorFormSchema` |
| `jobs` (existing paths kept) | `admin_portal.careers.*` | `JobFormSchema` (extended) |
| `job-departments` | `admin_portal.careers.*` | `JobDepartmentFormSchema` |
| `offices`, `testimonials`, `client-logos`, `credentials`, `faqs` | `admin_portal.site_content.*` | respective `*FormSchema` |

Deleting a Service/Sector/Category/Department/Office that is referenced returns `409` with the referencing items.

## Sections

`GET /api/admin/sections/:type` · `PUT /api/admin/sections/:type` — `:type` ∈ data-model "Section singletons";
body validated by the mapped schema; permission `site_content.update` (`estimator-config` → `estimator.update`,
`notification-settings`/`spam-settings` → `settings.notifications`).

## Leads & applications

| Method & path | Permission | Notes |
| --- | --- | --- |
| GET `/api/admin/leads?status=&source=&serviceId=&assignedToId=&from=&to=` | leads.view | contact + quote requests |
| GET `/api/admin/leads/:id` | leads.view | includes consent record |
| PATCH `/api/admin/leads/:id` `{ status?, assignedToId? }` | leads.update | |
| POST `/api/admin/leads/:id/notes` `{ body }` | leads.update | |
| GET `/api/admin/leads/export.csv?…filters` | leads.export | UTF-8 BOM for Excel Arabic |
| GET `/api/admin/applications?jobId=&status=` | applications.view | |
| GET `/api/admin/applications/:id` · PATCH · notes · export.csv | applications.* | |
| GET `/api/admin/applications/:id/resume` | applications.view | 302 to signed URL (5 min), audited |
| POST `/api/admin/privacy/export` `{ email }` | leads.erase or applications.erase | JSON of all records for the email |
| POST `/api/admin/privacy/erase` `{ email, confirm: true }` | leads.erase and applications.erase | deletes, writes `ErasureLog` |

## Operations

| Method & path | Permission | Notes |
| --- | --- | --- |
| POST `/api/preview/token` `{ kind: 'page' \| 'service' \| 'sector' \| 'article' \| 'job'; key }` | manage_content | returns `{ url }` to the web preview route |
| GET `/api/admin/outbox?status=failed` · POST `/api/admin/outbox/:id/retry` | settings.notifications | email delivery health |
| GET `/api/dashboard/stats` | existing | updated: new leads (7d), open jobs, applications (7d), estimator completions (7d), failed emails |
