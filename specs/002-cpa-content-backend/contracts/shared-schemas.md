# Shared schema contract (`packages/shared`)

**Feature**: `002-cpa-content-backend` — this is the integration seam with the UI (001/003, agy).

## Files

| File (validations / models) | Exports |
| --- | --- |
| `validations/common.schema.ts` (changed) | `MultiLanguageFieldSchema`, `RequiredTitleSchema` (**Arabic required**), `ImageRefSchema`, `LinkRefSchema`, `ActionRefSchema`, `SlugSchema`, `SaudiMobileSchema`, `PublicFormGuardSchema` (`consent`, `website`, `startedAt`, `turnstileToken?`) |
| `validations/site.schema.ts` (new) | `SiteChromeSectionSchema` (form) / `SiteChromeWebSchema`, `NavItemSchema`, `ContactChannelSchema`, `SocialLinkSchema` |
| `validations/pages.schema.ts` (new) | `HomePageSectionSchema` … `ContactPageSectionSchema`, `ServiceSharedSectionSchema`, `LegalPageSectionSchema` and their `*WebSchema` |
| `validations/service.schema.ts` (new) | `ServiceFormSchema`, `ServiceAdminSchema`, `ServiceSummaryWebSchema`, `ServiceDetailWebSchema` |
| `validations/sector.schema.ts` (new) | `SectorFormSchema`, `SectorAdminSchema`, `SectorSummaryWebSchema` |
| `validations/news.schema.ts` (changed) | `NewsFormSchema` (category, author, tags, sectors, services, publishedAt), `ArticleSummaryWebSchema`, `ArticleDetailWebSchema`, `ArticleCategory*`, `Author*`, `NewsQuerySchema` (+ category, sector, service) |
| `validations/job.schema.ts` (changed) | `JobFormSchema` (+ department, office, experience, closesAt, lists), `JobSummaryWebSchema`, `JobDetailWebSchema`, `JobDepartment*`, `JobApplicationSchema`, `JobApplicationStatusSchema` |
| `validations/reference.schema.ts` (new) | `Office*`, `Testimonial*`, `ClientLogo*`, `Credential*`, `FaqItem*` (Form/Admin/Web) |
| `validations/contact.schema.ts` (changed) | `ContactRequestSchema`, `LeadAdminSchema`, `LeadStatusSchema`, `LeadSourceSchema`, `LeadUpdateSchema`, `LeadNoteSchema` |
| `validations/estimator.schema.ts` (new) | `EstimatorConfigSchema`, `EstimatorPublicSchema`, `EstimateRequestSchema`, `EstimateResponseSchema`, `QuoteRequestSchema` |
| `validations/settings.schema.ts` (new) | `NotificationSettingsSchema`, `SpamSettingsSchema` |
| removed | `project`, `units`, `inquiry`, `community`, `investor-relation`, `media`, `mediaHero`, `location` (if unused), legacy `home`/`about` section schemas |

`models/*.model.ts`: `export type X = z.infer<typeof XSchema>` for every schema above.

## Mapping to design-system view models (001 `data-model.md`)

| Design-system type | Web schema | Mapping notes |
| --- | --- | --- |
| `ServiceSummary` | `ServiceSummaryWebSchema` | `href` built by web (`/${lang}/services/${slug}`); `ctaLabel` from `service-shared` |
| `SectorSummary` | `SectorSummaryWebSchema` | `href` → articles filtered by sector |
| `CaseStory` | `ArticleSummaryWebSchema` where category `isCaseStory` | `sector` = first sector title, `service` = first service title |
| `ArticleSummary`, `Author` | `ArticleSummaryWebSchema`, `AuthorWebSchema` | `date` = `publishedAt` ISO date |
| `JobSummary` | `JobSummaryWebSchema` | `department`, `city` = localized names, `contract` = localized employment type label (web dictionary) |
| `Office`, `ContactChannel`, `Testimonial`, `LogoItem`, `FaqItem`, `Stat`, `Pillar`, `ProcessStep`, `MethodologyRow`, `Perk` | `*WebSchema` / page section web schemas | 1:1 field names |
| `EstimatorConfig` | `EstimatorPublicSchema` | `estimate`/`quote.onSubmit` are web functions calling the estimator endpoints |
| `ImageRef` | `ImageRefSchema` `{ src, alt, width, height }` | API stores width/height on upload (sharp metadata) |
| `SiteChrome` | `SiteChromeWebSchema` | `localeSwitch` built by web |

Rule: field names in `*WebSchema` match the design-system types exactly; anything the web must compute (hrefs,
labels from dictionaries) is listed above. A contract test (`packages/shared/test/view-model-fixtures.test.ts`)
parses the 001 mock fixtures with these schemas.

## Versioning

Changes to `*WebSchema` after 001 merges require a note in the PR and agy's review (owner of consumers).
