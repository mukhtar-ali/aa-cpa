# Data Model: CPA Content & Lead Backend

**Feature**: `002-cpa-content-backend` | **Date**: 2026-11-18

Conventions (all relational entities unless stated): `id String @id @default(uuid())`, `createdAt`, `updatedAt`,
soft delete `isDeleted` + `deletedAt` where the existing pattern uses it, `order Int @default(0)` for sortable
lists, `isPublished Boolean @default(false)` + `publishedAt DateTime?` for publishable content (published =
`isPublished && publishedAt <= now()` in `Asia/Riyadh`). `ML` = multi-language JSON `{ ar: string; en: string }`.
`TR` = translation table `<Entity>Translation(language: Language, …)`, unique per (parent, language).
Arabic required on publish (research R3).
**Image fields** (`image`, `heroImage`, `bandImage`, `logo`, `avatar`, `coverImage`, page-section images) are JSON
`ImageField = { url: string; width: number; height: number; alt: ML }` (`ImageFieldSchema`); the upload endpoint
returns `width`/`height` from sharp metadata so admin forms fill them automatically. Where a table below says
`String?` for an image, read `ImageField?` (Json column). The existing `News.thumbnail` string is migrated to this shape.

## Removed

`Project`, `ProjectTranslation`, `Unit`, `UnitTranslation`, `Inquiry` (+ enums/indexes). Permission keys
`admin_portal.projects.*`, `admin_portal.media.*`, `admin_portal.group_locations` removed from `users.permissions`.

## Content entities

### Service  (new)
| Field | Type | Notes |
| --- | --- | --- |
| slug | String unique | ASCII, e.g. `external-audit` |
| image | String? | URL from uploads |
| heroImage | String? | |
| icon | String? | design-system `IconName` |
| highlight | JSON? | `{ label: ML; value: ML; note?: ML }` (homepage floating card) |
| methodology | JSON | `[{ title: ML; body: ML }]` ordered |
| deliverables | JSON | `[{ title: ML; body?: ML }]` |
| order, isPublished, publishedAt, isDeleted | | |
| translations | ServiceTranslation[] | |
| sectors | Sector[] (m-n `ServiceSector`) | related sectors |
| faqs | FaqItem[] | scope = service |

**ServiceTranslation (TR)**: `title`, `summary` (card text), `heroSubtitle`, `statement` (large intro),
`audience` (who needs it), `whyUs`, `metaTitle?`, `metaDescription?`, `keywords?`.

### Sector  (new)
| Field | Type | Notes |
| --- | --- | --- |
| slug | String unique | |
| icon | String? | sector icon name |
| order, isPublished | | |
| featured | Boolean | at most one featured → Sectors page photo band |
| bandImage | String? | used when featured |
| translations | SectorTranslation[] | `title`, `summary` (one line), `bandTitle?`, `bandBody?`, `bandCtaLabel?` |
| services | Service[] (m-n) | |
| articles | Article[] (via `ArticleSector`) | case stories and articles per sector |

### Article  (existing `News`, extended)
| Field | Change | Notes |
| --- | --- | --- |
| tag (NewsTag news/event) | **removed** | replaced by `categoryId` |
| categoryId | **new** FK → ArticleCategory | required on publish |
| authorId | **new** FK? → Author | |
| coverImage | rename of `thumbnail` | keep column name `thumbnail` via `@map` to avoid churn |
| readingMinutes | **new** Int? | computed from body on save when empty |
| tags | **new** JSON `ML[]` | |
| isFeatured | existing | featured block on Articles page |
| isCaseStory | derived | true when category `isCaseStory` |
| sectors | **new** m-n `ArticleSector` | |
| services | **new** m-n `ArticleService` | |
| publishedAt | existing | scheduling enabled |
| translations | NewsTranslation (+ `tocEnabled Boolean @default(true)`) | body HTML sanitized |

### ArticleCategory  (new)
`slug unique`, `name: ML`, `order`, `isCaseStory Boolean @default(false)` (exactly one case-stories category seeded).

### Author  (new)
`name: ML`, `role: ML`, `bio: ML`, `avatar String?`, `order`.

### Job  (existing, extended)
| Field | Change |
| --- | --- |
| departmentId | **new** FK → JobDepartment |
| officeId | **new** FK? → Office (city) |
| employmentType | existing enum (`full_time`, `part_time`, `contract`, `internship`) — add `cooperative_training` |
| experienceMin / experienceMax | **new** Int? (years) |
| closesAt | **new** DateTime? | applications refused after |
| responsibilities, requirements | **new** JSON `ML[]` |
| benefits | **new** JSON `[{ title: ML; body: ML }]` |
| translations | JobTranslation: `title`, `summary` (rename of `description`), `body` (role overview HTML), `location` (kept, optional override) |

### JobDepartment  (new)
`slug unique`, `name: ML`, `order`.

### Office  (new)
`city: ML`, `address: ML`, `mapUrl String?`, `mapX Int? / mapY Int?` (0–100 % on illustration), `image String?`,
`isHeadquarters Boolean`, `order`, `isPublished`.

### Testimonial  (new)
`quote: ML`, `rating Int? (1–5)`, `name: ML`, `role: ML`, `company: ML?`, `avatar String?`, `order`, `isPublished`,
`placement` JSON string[] (e.g. `["home","about","services","sectors"]`).

### ClientLogo  (new)
`name String`, `logo String`, `url String?`, `row Int @default(1)` (marquee row 1/2), `order`, `isPublished`.

### Credential  (new)
`name: ML`, `logo String`, `url String?`, `order`, `isPublished`.

### FaqItem  (new)
`question: ML`, `answer: ML` (sanitized HTML), `scope enum(global, contact, service)`, `serviceId String?`,
`order`, `isPublished`. Constraint: `scope = service ⇔ serviceId != null`.

### SlugRedirect  (new)
`entityType enum(service, sector, article, job)`, `fromSlug`, `toSlug`, unique (`entityType`, `fromSlug`).

## Section singletons (`Section.type` → Zod schema in `@repo/shared`)

| type | Schema | Contents |
| --- | --- | --- |
| `site-chrome` | `SiteChromeSectionSchema` | utility bar texts (licence, network, city), nav items `[{ label: ML; href }]`, header CTA, footer description, footer columns (quick links auto from nav + services auto from Services), registry numbers (CR, VAT), copyright `ML`, wordmark text, socials `[{ network; url }]`, contact channels (phone, email, whatsapp, hours `ML`) — supersedes social/contact fields of `website-info` (migrated) |
| `page-home` | `HomePageSectionSchema` | hero (title, accent, body, actions, image), gap (statement, eyebrow, body, images[2]), services block (eyebrow, title, accent, intro, ctaLabel; services auto), reasons (title, description, action, pillars[3] `{icon,title,body}`, image, stats[4]), credentials (title, description), process (eyebrow, title, accent, description, steps[4]), partner quote (title, body, action, image), news block (eyebrow, title, action; articles auto latest 4), estimator block (title, body), testimonial selection |
| `page-about` | `AboutPageSectionSchema` | hero, statement, licence body (2 paragraphs), action (profile PDF), signatory block (eyebrow, title, accent, paragraphs, action, image, caption), commitments (title, subtitle, items[3]), offices title, partner quote |
| `page-services` | `ServicesPageSectionSchema` | hero, statement, partner quote |
| `service-shared` | `ServiceSharedSectionSchema` | CTA cards (expert, faq) texts/actions, "not sure" title, FAQ title |
| `page-sectors` | `SectorsPageSectionSchema` | hero, statement, index title + description, case stories eyebrow/title/action |
| `page-articles` | `ArticlesPageSectionSchema` | hero, featured title, list eyebrow/title |
| `page-careers` | `CareersPageSectionSchema` | hero, perks (eyebrow, title, items[4] `{icon,title,body}`), team (eyebrow, title, accent, body, image, quote `{text,name,role,avatar}`, stats[3], photos[4]), jobs eyebrow/title, hiring steps (eyebrow, title, steps[4]), application (eyebrow, title, description), job sidebar question card |
| `page-contact` | `ContactPageSectionSchema` | hero, intro (eyebrow, title, body), form (title, subtitle), offices (eyebrow, title, map image), FAQ (eyebrow, title) |
| `legal-privacy`, `legal-terms` | `LegalPageSectionSchema` | `version`, `updatedAt`, hero, summary `ML[]`, sections `[{ id; title: ML; body: ML(html) }]`, pdfUrl `ML?`, question card |
| `estimator-config` | `EstimatorConfigSchema` | `status`, questions, pricing (bases, factors), rounding, spread, disclaimer, labels |
| `notification-settings` | `NotificationSettingsSchema` | `defaultInbox`, per-service recipients `{ serviceId: string[] }`, careers inbox, `retentionMonths` |
| `spam-settings` | `SpamSettingsSchema` | `turnstileEnabled`, `turnstileSiteKey`, `minFillSeconds` |

Every page section also has its per-page SEO in the existing `Seo` table (page keys: `home`, `about`, `services`,
`sectors`, `articles`, `careers`, `contact`, `privacy`, `terms`; per-entity SEO lives on translations).

## Lead entities

### ContactRequest  (existing `Contact`, reshaped; table `contacts`)
| Field | Type | Notes |
| --- | --- | --- |
| fullName | String(100) | |
| company | String(150)? | |
| mobile | String(20) | Saudi format `05XXXXXXXX` or E.164; normalised to E.164 |
| email | String(100) | |
| serviceId | String? FK → Service | "required service" select; null = general |
| message | Text? | required for `source=contact` |
| source | enum(contact, estimator, service_page) | |
| estimatorAnswers | JSON? | |
| estimatedRange | JSON? | `{ min, max, currency }` |
| language | Language | submission language (reply language) |
| status | enum(new, contacted, qualified, closed, spam) | replaces free string |
| assignedToId | String? FK → User | |
| notes | JSON | `[{ authorId, body, at }]` |
| removed | `subject`, `department` | dropped (not in design) |

### JobApplication  (existing, reshaped)
`fullName` (replaces first/last), `email`, `mobile`, `linkedinUrl?`, `motivation?` (rename of `coverLetter`),
`resumeKey` (private storage key; replaces `resumeUrl`), `resumeName`, `resumeSize`, `language`, `status` enum
(`pending`, `reviewed`, `shortlisted`, `interview`, `offer`, `hired`, `rejected`), `assignedToId?`, `notes JSON`.
State flow: pending → reviewed → shortlisted → interview → offer → hired; any → rejected.

### ConsentRecord  (new)
`subjectType enum(contact, application, quote)`, `subjectId`, `email`, `purpose String`, `policyVersion String`,
`language`, `ipHash String(64)`, `userAgent String(255)`, `consentedAt DateTime`.

### EmailOutbox  (new)
`kind enum(email, revalidate)`, `template String?`, `to String?`, `language`, `payload JSON`, `status
enum(pending, sending, sent, failed)`, `attempts Int`, `nextAttemptAt DateTime`, `lastError Text?`, `sentAt?`.
Index (`status`, `nextAttemptAt`).

### ErasureLog  (new)
`emailHash`, `requestedById`, `itemsErased JSON`, `at` — proof of PDPL erasure without keeping the personal data.

## Permissions (`PermissionEnum`) — after this feature

Kept: users.*, permissions.update, manage_content, news.* (shown as "Articles"), careers.*, monitoring.view.
Added: `services.{view,create,update,delete}`, `sectors.{view,create,update,delete}`,
`site_content.{view,update}` (sections, offices, testimonials, logos, credentials, FAQs),
`leads.{view,update,export,erase}` (contact requests + quotes), `applications.{view,update,export,erase}`,
`estimator.update`, `settings.notifications`. Removed: projects.*, media.*, group_locations.

## Validation rules (shared schemas)

- Slugs: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 120, unique per entity.
- `mobile`: Saudi mobile `^(?:\+9665|05)\d{8}$` or international E.164 when `country != SA`.
- `email`: existing `emailValidation`.
- Text limits: fullName ≤ 100, company ≤ 150, message 10–3000, motivation ≤ 2000.
- `consent: z.literal(true)`; honeypot `website: z.literal('')`; `startedAt` ISO ≥ 3 s before submit.
- CV: PDF/DOCX by magic bytes, ≤ 5 MB.
- Publish guard: Arabic `title` (and `summary` for Service/Sector, `body` for Article/Job) non-empty.
