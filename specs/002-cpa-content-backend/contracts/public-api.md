# Public API contract (`apps/api`, consumed by `apps/web`)

**Feature**: `002-cpa-content-backend`

- Base: `${BASE_URL}`; language via `?lang=ar|en` or `Accept-Language` (existing `lang.middleware`); default `ar`.
- All `GET` responses are localized (plain strings) by `LocaleInterceptor`, validated by the `*WebSchema` named
  below (in `@repo/shared`), and cacheable (`Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`)
  unless `X-Preview-Token` is present (`no-store`, includes unpublished).
- Entities with missing English text return Arabic values and `isFallback: true`.
- Errors: existing exception filter shape `{ statusCode, message, errors?: { field: message }[] }` with localized
  messages.
- Endpoint paths are added to `endpoint` in `packages/shared/src/utils/endpoint.ts`.

## Site

| Method & path | Response schema | Notes |
| --- | --- | --- |
| GET `/api/site/chrome` | `SiteChromeWebSchema` | header nav, utility bar, footer (incl. services list and offices), socials, contact channels, legal ids |
| GET `/api/site/seo-global` | existing `GlobalSeoSettingsModelWeb` | unchanged |

## Pages (one call per page: SEO + page section + referenced collections)

| Method & path | Response schema |
| --- | --- |
| GET `/api/pages/home` | `HomePageWebSchema` = `{ seo, hero, gap, clients: { rows: LogoItem[][] }, services: { …block, items: ServiceSummary[] }, reasons, credentials: { …, logos }, process, partnerQuote, news: { …, items: ArticleSummary[] }, estimator: EstimatorPublicSchema \| null, testimonial }` |
| GET `/api/pages/about` | `AboutPageWebSchema` (incl. credentials, clients, offices, testimonial, estimator) |
| GET `/api/pages/services` | `ServicesPageWebSchema` (incl. services list) |
| GET `/api/pages/sectors` | `SectorsPageWebSchema` (incl. sectors, clients, featured sector band, case stories, estimator) |
| GET `/api/pages/articles?category=&page=&pageSize=` | `ArticlesPageWebSchema` `{ seo, hero, featured: ArticleSummary[], categories, items: Paginated<ArticleSummary> }` |
| GET `/api/pages/careers?department=` | `CareersPageWebSchema` (incl. departments, jobs, perks, team, hiring steps) |
| GET `/api/pages/contact` | `ContactPageWebSchema` (incl. channels, offices, faqs scope=contact, service options) |
| GET `/api/pages/legal/:key` (`privacy` \| `terms`) | `LegalPageWebSchema` |

## Collections & details

| Method & path | Response schema | Notes |
| --- | --- | --- |
| GET `/api/services` | `ServiceSummaryWeb[]` | ordered |
| GET `/api/services/:slug` | `ServiceDetailWebSchema` | hero, statement, audience, methodology, deliverables, whyUs, faqs, sharedCtas, related sectors, seo; `{ redirectTo }` if slug moved; 404 otherwise |
| GET `/api/sectors` | `SectorSummaryWeb[]` | |
| GET `/api/articles?category=&sector=&service=&page=&pageSize=&featured=` | `Paginated<ArticleSummaryWeb>` | `sector` filter powers sector "learn more" |
| GET `/api/articles/:slug` | `ArticleDetailWebSchema` | body HTML, toc `[{id,label}]`, author, tags, related (4, same category/sector), seo |
| GET `/api/jobs?department=&page=` | `Paginated<JobSummaryWeb>` | open jobs only |
| GET `/api/jobs/:slug` | `JobDetailWebSchema` | summary rows, responsibilities, requirements, benefits, similar jobs (3), `isOpen` |

## Estimator

| Method & path | Body | Response |
| --- | --- | --- |
| GET `/api/estimator` | — | `EstimatorPublicSchema` (questions, labels, disclaimer) or 404 when not approved |
| POST `/api/estimator/estimate` | `EstimateRequestSchema` `{ answers: Record<questionId, string \| number> }` | `EstimateResponseSchema` `{ min, max, currency: 'SAR', disclaimer, isDraft }` — throttled 30/10 min |
| POST `/api/estimator/quote` | `QuoteRequestSchema` `{ answers, range, fullName, mobile, email, consent: true, website: '', startedAt, turnstileToken? }` | `201 { ok: true }` |

## Forms

| Method & path | Body | Response |
| --- | --- | --- |
| POST `/api/contact` | `ContactRequestSchema` `{ fullName, company?, mobile, email, serviceId?, message, consent: true, website: '', startedAt, turnstileToken? }` | `201 { ok: true }`; 422 with field errors |
| POST `/api/jobs/:slug/apply` | multipart: `JobApplicationSchema` fields `{ fullName, email, mobile, linkedinUrl?, motivation?, consent, website, startedAt, turnstileToken? }` + `resume` file | `201 { ok: true }`; 409 job closed; 413/415 file errors |

## Preview

| Method & path | Notes |
| --- | --- |
| Header `X-Preview-Token: <jwt>` on any GET above | token from admin `POST /api/preview/token`; includes drafts, `no-store` |
