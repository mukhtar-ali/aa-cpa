# Data Model: AA-CPA Public Design System (UI view models)

**Feature**: `001-design-system` | **Date**: 2026-11-18

The library persists nothing. These are the **view-model shapes** components accept as props. They live in
`packages/design-system/src/types/` until feature `002` publishes matching Zod schemas in `@repo/shared`; then
the library re-exports/infers from those schemas and deletes its local copies (see "Alignment with 002").

Conventions:
- All user-visible strings are already localized by the caller (`string`), never `{ ar, en }` objects. The
  page layer picks the locale.
- `Href` = `string` (internal paths are already locale-prefixed by the caller, e.g. `/ar/services/audit`).
- Optional fields render nothing when absent (spec Edge Cases).
- Text-bearing view models accept optional `textLang?: 'ar' | 'en'`; when it differs from the page locale the component
  renders that text with matching `lang` and `dir` (used for Arabic fallback text on English pages — 003 US1).

## Shared value types

```ts
type Href = string;
type Locale = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface ImageRef {           // used by every image-bearing component
  src: string;                 // absolute URL or /public path
  alt: string;                 // '' only together with decorative: true
  width: number;               // intrinsic size, prevents layout shift (FR-056)
  height: number;
  decorative?: boolean;
  blurDataURL?: string;
}

interface LinkRef { label: string; href: Href; external?: boolean; }

interface ActionRef extends LinkRef {   // CTA rendered as Button
  variant?: 'primary' | 'secondary' | 'paper' | 'link';
}

type IsoDate = string;          // '2026-10-12'; formatted with lib/format
```

## Entities

### NavItem
| Field | Type | Rules |
| --- | --- | --- |
| label | string | required |
| href | Href | required |
| active | boolean? | sets `aria-current="page"` |
| children | NavItem[]? | one level only (not used by approved designs; reserved) |

### SiteChrome (header, utility bar, footer input)
| Field | Type | Rules |
| --- | --- | --- |
| logo | `{ href; label }` | label = accessible name (company name) |
| utility | `{ license: string; network: string; city: string; phone: ContactChannel }` | |
| nav | NavItem[] | 5–7 items in design |
| cta | ActionRef | "Request a quote" |
| localeSwitch | `{ current: Locale; label: string; href: Href }` | label shows target ("EN"/"ع") |
| footer | `{ description; socials: SocialLink[]; columns: FooterColumn[]; contacts: ContactChannel[]; legal: { copyright; registry: string[]; links: LinkRef[] }; backToTopLabel; wordmark: string }` | |

`SocialLink = { network: 'linkedin' | 'x' | 'instagram' | 'whatsapp'; href; label }`
`FooterColumn = { title: string; links: LinkRef[] }`

### ContactChannel
| Field | Type | Rules |
| --- | --- | --- |
| type | `'phone' \| 'email' \| 'whatsapp' \| 'hours'` | selects icon |
| label | string | e.g. "الهاتف" |
| value | string | displayed with `dir="ltr"` isolation for phone/email |
| href | Href? | `tel:`, `mailto:`, `https://wa.me/…`; none for hours |

### Office
`{ city: string; address: string; mapHref?: Href; mapLabel?: string; image?: ImageRef; isHeadquarters?: boolean; coordinates?: { x: number; y: number } }`
(`coordinates` = percentage position on the static map illustration.)

### Stat
`{ value: number | string; prefix?: string; suffix?: string; label: string }`
Numeric values formatted with `formatNumber(locale)`; e.g. `{ value: 120, prefix: '+', label: 'عميلاً في 8 قطاعات' }`.

### ServiceSummary
`{ id: string; title: string; summary: string; image?: ImageRef; href?: Href; ctaLabel?: string; highlight?: { label: string; value: string; note?: string } }`
(`highlight` = floating stat card on homepage "why" section, e.g. 24 ساعة.)

### Pillar (feature card)
`{ icon: IconName; title: string; body: string }`

### ProcessStep
`{ index: number; title: string; body: string }` — index rendered zero-padded (`01`).

### MethodologyRow
`{ title: string; body: string }`

### SectorSummary (approved Sectors page `547:4555`)
`{ id: string; title: string; summary: string; href?: Href }` — index rows (title + one-line description).

### CaseStory
`{ title: string; sector: string; service?: string; image: ImageRef; href: Href; ctaLabel: string }`

### ArticleSummary
`{ id: string; title: string; category: string; date: IsoDate; readingMinutes?: number; image: ImageRef; href: Href; excerpt?: string; author?: Author }`

### Author
`{ name: string; role?: string; avatar?: ImageRef; bio?: string }`

### ArticleBody blocks (rendered by `ArticleBody`)
Rich content arrives as sanitized HTML from the CMS (existing CKEditor pipeline). `ArticleBody` styles the
allowed elements: `h2, h3, p, ul, ol, li, blockquote (pull quote with optional <cite>), figure, img,
figcaption, a, strong, em`. Heading `id`s feed the TOC.

### TocItem
`{ id: string; label: string; index?: number }`

### JobSummary
`{ id: string; title: string; department: string; city: string; contract: string; experience?: string; postedAt?: IsoDate; closesAt?: IsoDate; href: Href }`

### Perk
`{ icon?: IconName; title: string; body: string }`

### Testimonial
`{ quote: string; rating?: 1 | 2 | 3 | 4 | 5; name: string; role: string; company?: string; avatar?: ImageRef }`

### FaqItem
`{ id: string; question: string; answer: string /* plain text or sanitized HTML */ }`

### LogoItem
`{ name: string; image?: ImageRef; href?: Href; placeholder?: boolean }` — `placeholder` cells render only in
the workbench (`showPlaceholders` prop), never in production.

### LegalSection
`{ id: string; title: string; html: string }`; document: `{ updatedAt: IsoDate; summary: string[]; sections: LegalSection[]; downloadHref?: Href }`

### EstimatorConfig
| Field | Type | Rules |
| --- | --- | --- |
| questions | EstimatorQuestion[] | exactly 4 in design; component supports 1–8 |
| labels | `{ progress: string /* "السؤال {n} من {total}" */; next; back; start; result; disclaimer; restart }` | |
| currency | `'SAR'` | |
| estimate | `(answers: Record<string, string \| number>) => Promise<{ min: number; max: number }>` | supplied by caller (API call in 003); mock in this feature |
| quote | `{ label: string; fields: { name; mobile; email; consent } labels; submitLabel; successMessage; onSubmit(data, answers, range): Promise<void> }` | optional "Request a formal quote" step after the result |

`EstimatorQuestion = { id: string; prompt: string; hint?: string; kind: 'currency' | 'number' | 'choice'; options?: { value: string; label: string }[]; min?: number; max?: number; placeholder?: string }`

**State machine** (client component):

```text
idle(q=0) --answer valid + next--> question(q+1) ... --> question(last) --submit--> result
question(q>0) --back--> question(q-1)
result --restart--> idle(q=0)
result --request quote--> quote-form --submit ok--> quote-sent ; --submit error--> quote-form (error announced)
invalid answer --next--> stays, field error announced
```

### Form field model (shared by inputs)
`{ name: string; label: string; required?: boolean; help?: string; error?: string; disabled?: boolean }`
File upload adds `{ accept: string[] /* ['application/pdf', '.docx'] */; maxBytes: number /* 5_242_880 */; value?: File | { name: string; size: number } }`.

## Alignment with 002 (backend)

| View model | Planned `@repo/shared` schema (feature 002) |
| --- | --- |
| ServiceSummary, ProcessStep, MethodologyRow, FaqItem | `ServiceSchema` (+ details) |
| SectorSummary, CaseStory | `SectorSchema`, `CaseStorySchema` |
| ArticleSummary, Author | existing `News*` schemas, extended with category, reading time, author |
| JobSummary | existing `Job*` schemas, extended with department/contract/experience |
| Testimonial, LogoItem, Stat, Office, SiteChrome | CMS `Section` schemas (`home-*`, `website-info`, `offices`, `clients`) |
| EstimatorConfig | `EstimatorSettingsSchema` + `EstimateRequest/Response` |

Rule: when a `@repo/shared` schema lands, the library's type becomes `z.infer<…>`-derived *or* a mapper in
`apps/web` converts API DTO → view model. Library types never import from `apps/*`.
