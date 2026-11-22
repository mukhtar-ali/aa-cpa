# Data Model: Public Site Pages

**Feature**: `003-public-site-pages` | **Date**: 2026-11-18

003 adds no persisted entities. Content entities and their schemas are defined by 002
(`specs/002-cpa-content-backend/data-model.md`, `contracts/shared-schemas.md`); UI view models by 001
(`specs/001-design-system/data-model.md`). This file defines the web app's own state and the mapping layer.

## Client/browser state

| State | Where | Shape | Lifetime |
| --- | --- | --- | --- |
| Language preference | cookie `NEXT_LOCALE` | `'ar' \| 'en'` | 1 year; set on language switch |
| Draft mode | Next draft-mode cookie | opaque | until `/api/preview/exit` or browser session |
| Estimator answers | React state in `EstimatorClient` | `Record<questionId, string \| number>` | page lifetime; never persisted |
| Form state | `useActionState` | `FormResult` (below) | page lifetime |

## Server Action result

```ts
type FormResult =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors: Record<string, string> } // localized
  | { status: 'closed' };                                                     // job closed (apply only)
```

## Fetch tags (cache invalidation keys)

`chrome`, `page:{home|about|services|sectors|articles|careers|contact}`, `legal:{privacy|terms}`, `services`,
`service:{slug}`, `sectors`, `articles`, `article:{slug}`, `jobs`, `job:{slug}`, `estimator`, `redirects` (004).
002 sends the affected tags to `POST /api/revalidate` (see contracts/web-endpoints.md).

## Mapping layer (`apps/web/src/mappers`)

| Mapper | Input (002 web schema) | Output (001 view model / props) | Adds |
| --- | --- | --- | --- |
| `toImageRef` | `ImageField` (localized alt) | `ImageRef` | — |
| `toChrome` | `SiteChromeWeb` | `Header`, `UtilityBar`, `Footer`, `MobileNav` props | locale-switch href, dictionary labels |
| `toServiceSummary` / `toServiceDetail` | `ServiceSummaryWeb` / `ServiceDetailWeb` | `ServiceSummary`, page sections | `/{lang}/services/{slug}`, contact CTA `?service={slug}` (the contact page resolves slug → `serviceId` for the form) |
| `toSectorSummary` | `SectorSummaryWeb` | `SectorSummary` | `/{lang}/articles?sector={slug}` |
| `toArticleSummary` / `toCaseStory` | `ArticleSummaryWeb` | `ArticleSummary` / `CaseStory` | href, `readMoreLabel` |
| `toJobSummary` | `JobSummaryWeb` | `JobSummary` | contract-type label from dictionary |
| `toEstimatorConfig` | `EstimatorPublic` | `EstimatorConfig` | `estimate`/`quote.onSubmit` bound to Server Actions |
| page mappers (`home`, `about`, …) | `*PageWeb` | page section props | breadcrumbs, `lang` attribute for fallback blocks |

Rule: when a web DTO has `isFallback: true` (or a value carries `textLang: 'ar'`), the mapper sets `textLang: 'ar'` on
the view model; 001 components render that text with `lang="ar" dir="rtl"` on English pages (spec US1 scenario 4).
