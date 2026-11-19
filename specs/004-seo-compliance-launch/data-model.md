# Data Model: SEO, Analytics, Compliance & Launch

**Feature**: `004-seo-compliance-launch` | **Date**: 2026-11-18

Additions to the 002 data model (implemented by the backend run, area `apps/api` / `packages/shared` / `apps/admin`).

## Redirect  (new table `redirects`)

| Field | Type | Rules |
| --- | --- | --- |
| id | uuid | |
| fromPath | String(500) unique | path only, starts with `/`, lower-cased, no host, query ignored; may be a legacy path without locale |
| toPath | String(500) | internal path (`/ar/...`) or absolute URL; must not equal `fromPath`; chains resolved on save (no A→B→C) |
| type | enum(`permanent`, `temporary`) | 308/307 at the edge |
| source | enum(`manual`, `legacy_import`, `slug_change`) | 002 `SlugRedirect` entries are mirrored here as `slug_change` |
| hits | Int @default(0) | incremented asynchronously (batched) |
| lastHitAt | DateTime? | |
| createdById | String? FK → User | |
| createdAt / updatedAt | | |

Validation: max 5,000 rows; CSV import columns `from,to,type`; import is all-or-nothing with a row-level error report.

## Image license note  (extends 002 `ImageField`)

`ImageField` gains optional `license: { source: string; reference?: string; expiresAt?: IsoDate }` used by the content
audit to flag unlicensed or expiring images. Admin image picker exposes it.

## SEO additions  (extends existing `Seo` content JSON and per-entity translations)

- `ogImage: ImageField?` per page and per entity (service, article, job).
- `noindex: boolean` per page/entity (default false).
- Global (`seo-global` section): `organization` block for JSON-LD — legal name `ML`, licence number (`522`), founding
  year, `sameAs` socials (from `site-chrome`), logo; `consentVersion` (string, bump re-prompts banner);
  `consentTexts` (bilingual banner/preferences copy and category descriptions); `gtmId`,
  `gaMeasurementId`, `metaPixelId?` (existing fields reused where present).

## Consent preference  (browser cookie, not stored server-side)

Cookie `aacpa_consent` (first-party, 12 months, `SameSite=Lax`, `Secure`):
`{ v: string /* consentVersion */, c: { analytics: boolean, marketing: boolean }, t: number /* epoch ms */ }`.
Necessary cookies (`NEXT_LOCALE`, draft mode, CSRF/auth on admin) are always allowed and listed in the cookie policy.

## Dashboard aggregates  (read model, no new table)

From `ContactRequest`, `JobApplication`, `MonitoringEvent`: leads by `source`, `serviceId`, `landingPath` (column
already defined in 002, sent in the form body by the 003 Server Action), estimator completions per day (server-side
`estimator.completed` events only); filters `from`, `to`.

## Launch artefacts  (files, not data)

`docs/launch/legacy-redirects.csv`, `docs/launch/runbook.md`, `docs/launch/go-live-checklist.md`,
`docs/launch/hypercare.md`, `docs/compliance/record-of-processing.md`, `docs/compliance/accessibility-statement.{ar,en}.md`,
`docs/admin-guide/{ar,en}.md`, review reports under `specs/004-seo-compliance-launch/reviews/`.
