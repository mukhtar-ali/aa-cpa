# UI Contract: `@repo/design-system` public API

**Feature**: `001-design-system` | **Date**: 2026-11-18

This is the library's external interface: every exported component, its import path, props (view models from
[data-model.md](../data-model.md)), variants, client/server nature, and the Figma node it implements.

Figma links: `https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=<id with - instead of :>`.
"Page ref" = the approved page frame + section where the component appears; resolve exact instance ids with
`get_metadata` on that frame. Component-sheet ids (Components page) are cited only for symbols that the
approved pages instantiate; older library versions (v14–v19, "Lux", "Redesign components", "Base components"
except where cited) MUST NOT be used as references.

Legend: **S** = server-safe (no `"use client"`), **C** = client component.

## Global rules (apply to every component)

1. Accepts `className` (merged with `cn()`), forwards `ref` where it wraps a single DOM element, spreads safe
   native attributes.
2. No hard-coded copy; accessible names come from props (e.g. `closeLabel`, `pauseLabel`).
3. Logical CSS only; directional icons mirror in RTL.
4. Optional props absent → element not rendered (no empty wrappers).
5. Each component has `X.stories.tsx` (every variant × state, AR + EN) and `X.test.tsx` (render, variants,
   RTL/LTR, keyboard, axe), and a JSDoc header `@figma <node-id>`.

## Import paths

| Path | Contents |
| --- | --- |
| `@repo/design-system/styles.css` | tokens, theme mapping, base, fonts' `font-family` hookup, `@source` |
| `@repo/design-system/primitives` | Button, IconButton, Link, Heading, Text, Eyebrow, Chip, FilterChip(Group), MetaPill, CategoryBadge, Divider, Avatar, Rating, Breadcrumbs, Pagination, SlideCounter, Logo, LanguageToggle, VisuallyHidden |
| `@repo/design-system/forms` | Field, TextInput, Textarea, Select, Checkbox, FileUpload, FormErrorSummary |
| `@repo/design-system/layout` | DesignSystemProvider, Container, Section, Pattern, UtilityBar, Header, MobileNav, Footer, PageHero, WhatsAppFloat |
| `@repo/design-system/sections` | all content components below |
| `@repo/design-system/icons` | `Icon` + named icon components, `IconName` type |
| `@repo/design-system/lib` | `cn`, `formatNumber`, `formatCurrency`, `formatDate`, `useReducedMotion` |
| `@repo/design-system/types` | view-model types |

## Foundations & layout

| Component | Props (summary) | Variants | S/C | Figma |
| --- | --- | --- | --- | --- |
| DesignSystemProvider | `locale: Locale; dir: Direction; children` | — | C | — (wraps Radix DirectionProvider) |
| Container | `as?; size?: 'default' \| 'wide' \| 'full'` | default = 1140 content | S | homepage content column |
| Section | `tone: 'page' \| 'ice' \| 'surface' \| 'inverse' \| 'hero'; rounded?: 'none' \| 'top' \| 'bottom' \| 'both'; pattern?: PatternName; spacing?: 'md' \| 'lg' \| 'xl'; as?; aria-labelledby?` | 5 tones × rounded | S | `411:169` section frames (e.g. `411:3712`, `411:3728`) |
| Pattern | `name: 'flow-lines' \| 'dots-grid' \| 'logo-lines'; tone: 'light' \| 'dark'` | — | S, `aria-hidden` | `413:323`, `411:171`, `428:2043` |
| UtilityBar | `license; network; city; phone: ContactChannel; localeSwitch` | — | S | `411:3807` (Header instance, top row) |
| Header | `logo; nav: NavItem[]; cta: ActionRef; utility?; localeSwitch; menuLabel; closeLabel` | `theme: 'hero' \| 'solid'` | S shell + C `MobileNav` | `2:3`, instance `411:3807` |
| MobileNav | `nav; cta; localeSwitch; open/onOpenChange (uncontrolled default); labels` | — | C (Radix Dialog) | not in Figma — team design, client review (FR-031) |
| Footer | `SiteChrome['footer'] & { logo }` | — | S (+ C back-to-top) | `407:85`, instance `411:3881` |
| PageHero | `title; subtitle?; image: ImageRef; breadcrumbs?: LinkRef[]; action?: ActionRef` | — | S | About `445:36452`, Services `448:41066`, Service Details `448:41873` (with action) |
| WhatsAppFloat | `href; label` | — | S | `226:10011` (sheet) — position bottom-end |

## Primitives

| Component | Props (summary) | Variants / states | S/C | Figma |
| --- | --- | --- | --- | --- |
| Button | `variant: 'primary' \| 'secondary' \| 'outline-light' \| 'link'; size: 'md' \| 'lg'; href?; loading?; disabled?; startIcon?; endIcon?; asChild?` | hover, focus-visible, pressed, disabled, loading (`aria-busy`) | S | `64:20` set; homepage `411:3706` primary, `411:3709` secondary, `411:3735` paper-on-dark, `411:3714` link+arrow |
| IconButton | `label (required); icon; variant: 'outline' \| 'solid' \| 'ghost-light'; size: 'sm' \| 'md'; href?` | as above | S | Share `505:3864`, Slider nav `529:4427`, footer socials |
| Link | `href; external?; variant: 'inline' \| 'nav' \| 'arrow'` | hover/focus | S | text/link usage |
| Heading | `level: 1–6; size?: 'h1'…'h6' (visual override); accent?: string (second line, gradient); tone?: 'default' \| 'inverse'` | gradient accent only for h1–h3 sizes (R4) | S | `Heading/H1…H6` styles |
| Text | `size: 'lg' \| 'md' \| 'sm' \| 'xs'; weight: 'regular' \| 'bold' \| 'extrabold'; tone: 'body' \| 'muted' \| 'strong' \| 'inverse' \| 'inverse-muted'; as?` | — | S | `Body/*` styles |
| Eyebrow | `children; tone?` | light/dark | S | `86:230` pattern as used on pages, e.g. `411:3722` |
| Chip | `children` | — | S | article tags (`506:2706`) |
| FilterChip / FilterChipGroup | `items: {value,label}[]; value; onValueChange; label` | default/selected | C | `499:1149` |
| MetaPill | `icon: 'location' \| 'contract' \| 'experience' \| 'date'; children` | — | S | `529:4333` |
| CategoryBadge | `children; tone?: 'green' \| 'teal'` | dot + label | S | news card category `423:1145` |
| Divider | `orientation; tone` | — | S | proof box dividers `411:3785` |
| Avatar | `image?; name` (initials fallback) | sm/md | S | `411:3878` |
| Rating | `value: 1–5; label` | — | S | `411:3871` |
| Breadcrumbs | `items: LinkRef[]; label` | light/dark | S | Article `506:2706`, Job `514:3194` |
| Pagination | `page; pageCount; hrefFor(page)` or `onPageChange`; `labels` | active/default | S (links) | `530:4416`, Blog `473:36031` |
| SlideCounter | `current; total; label` | progress bar | S | Services `448:41066` ("01 / 05") |
| Logo | `variant: 'on-dark' \| 'on-light'; label` | — | S | `65:56`, `78:197` |
| LanguageToggle | `href; label; current` | — | S | `64:28` |

## Forms

| Component | Props | States | S/C | Figma |
| --- | --- | --- | --- | --- |
| Field | `label; required?; help?; error?; children (control); id?` | — | S | `522:1185` |
| TextInput | Field model + native input props; `theme?: 'light' \| 'dark'`; `inputMode` | default, focus, filled, error, disabled | S | `522:1185` (Type=Text), dark: estimator `411:3863` |
| Textarea | as TextInput | same | S | `522:1185` (Type=Textarea) |
| Select | Field model + `options; placeholder` (native select) | same | S | Contact `524:3651` service select |
| Checkbox | `label (ReactNode, may contain link); required?; error?` | off/on, focus, error | S | `522:1194` |
| FileUpload | Field model + `accept; maxBytes; labels; onFileChange` | empty, drag-over, uploaded, error | C | `522:1214` |
| FormErrorSummary | `title; errors: {fieldId,message}[]` | — | S | team design |

## Sections (content components)

| Component | Props (data-model) | Variants | S/C | Figma |
| --- | --- | --- | --- | --- |
| SectionHeading | `eyebrow?; title; accent?; description?; action?: ActionRef; align?: 'start' \| 'split'` | light/dark | S | `530:4339`; homepage `411:3827`–`411:3829` |
| HomeHero | `title; body; actions: ActionRef[]; image: ImageRef` | — | S | `411:169` top (`411:3700`, `411:3701`, `411:3702`) |
| Statement | `children (text); accentWords?` | gradient/teal large text | S | homepage `411:3796`; About, Services intros |
| GapSection (Intro split) | `statement; eyebrow; body; images: ImageRef[2]` | — | S | `411:3788` |
| LogoMarquee | `rows: LogoItem[][]; pauseLabel; playLabel; speed?` | 2 rows, opposite directions | C | `569:5848` |
| CredentialsGrid | `title; description?; logos: LogoItem[]; showPlaceholders?` | dark | S | `585:6030` |
| ServiceTabs | `eyebrow; title; accent?; intro; services: ServiceSummary[]; ctaLabel` | — | C (Radix Tabs) | `411:3712`, floating card `425:2` |
| ServiceCard | `service: ServiceSummary` | horizontal (image start) | S | Services `448:41066` list |
| PillarCard | `pillar: Pillar; tone: 'dark' \| 'light'; size?: 'sm' \| 'wide'` | — | S | homepage `411:3738`/`411:3745`/`411:3759`; Careers perks `529:4388` |
| ReasonsSection | `title; description; action; pillars; image; stats: Stat[]` | dark | S | `411:3728` |
| StatTile / StatsStrip | `stats: Stat[]; tone` | light/dark, with dividers | S | `411:3772`, `530:4369`, Careers `519:38941` |
| ProcessSteps | `steps: ProcessStep[]` | cards (01–04) | S | `411:3825`, `530:4391` |
| TimelineStepper | `steps: ProcessStep[]; current?` | horizontal / vertical (<md) | S | Careers hiring steps `519:38941` |
| MethodologyList | `title; rows: MethodologyRow[]` | ice tone | S | Service Details `448:41873` |
| PhotoQuoteBand | `title; body; action; image: ImageRef; pattern?` | image start/end | S | `411:3846`; Sectors band `547:4555` |
| CtaCards | `expert: {title; body; action}; faq: {title; body; action}` | dark + light | S | `473:36122`, `473:36200` |
| FaqAccordion | `title?; items: FaqItem[]; defaultOpen?` | open/closed | C (Radix Accordion) | `463:1158` |
| NewsCard | `article: ArticleSummary; readMoreLabel` | default/hover | S | `423:1145` |
| ArticleCardCompact | `article; divider?` | divider on/off | S | `501:1155` |
| FeaturedNews | `lead: ArticleSummary; list: ArticleSummary[]; label` | — | S | Blog `473:36031` |
| NewsGrid | `articles; filters?; pagination?` | — | S (+ C filters) | Blog, homepage `426:29895` |
| RelatedCarousel | `title; eyebrow; items: ArticleSummary[]; labels` | prev/next + counter | C (scroll-snap) | Article `506:2706` bottom |
| ArticleHeader | `breadcrumbs; category; title; author; date; readingMinutes; share` | — | S | `506:2706` |
| ArticleBody | `html; figureCaption?` | prose styles | S | `506:2706` |
| TableOfContents | `title; items: TocItem[]` | sticky, active item | C (IntersectionObserver) | Article, Privacy `525:3854` |
| AuthorCard | `author: Author` | — | S | `506:2706` |
| ShareBox | `title; url; networks; copyLabel; copiedLabel; tone` | dark sidebar / light inline | C (copy) | `506:2706`, Job `514:3194` |
| JobRow | `job: JobSummary; ctaLabel` | default/hover | S | `512:1159` |
| JobSummaryCard | `rows: {label; value}[]; action` | dark | S | Job `514:3194` |
| PerkTile | `perk: Perk` | — | S | `529:4296` |
| OfficeCard | `office: Office` | with/without image | S | `529:4280`; About offices |
| ContactItem | `channel: ContactChannel` | phone/email/whatsapp/hours | S | `527:5423` |
| OfficeMap | `offices: Office[]; label; attribution?` | static illustration with pins | S | Contact `524:3651` |
| SectorIndex | `title; description; sectors: SectorSummary[]` | rows | S | Sectors `547:4555` |
| CaseStoryCard / CaseStories | `story: CaseStory` / `title; eyebrow; stories; action` | — | S | Sectors `547:4555` |
| Testimonial | `testimonial: Testimonial` | — | S | `411:3854` (start column) |
| Estimator | `config: EstimatorConfig; title; intro` | question / result / quote-form / quote-sent; dark card | C | `411:3855`; result + quote steps: team design in same language |
| EstimatorSection | `title; body; estimator; testimonial` | — | S shell + C | `411:3854` |
| LegalDocument | `title; doc; toc labels; questionCard: {title; body; action}` | — | S (+ C TOC) | `525:3854`, `525:4136` |
| ApplicationFormLayout | `title; eyebrow; description; children` | ice section card | S | Job `514:3194` apply form |
| ContactFormLayout | `title; subtitle; channels: ContactChannel[]; socials; children` | — | S | Contact `524:3651` |

## Added by later features (same conventions; built in those features' batches)

Figma has no designs for these; they follow the 001 visual language and need client review.

| Component | Props (summary) | S/C | Added by |
| --- | --- | --- | --- |
| SkipLink | `href ('#main'); label` | S | 003 T009 |
| ErrorState | `code: 404 \| 500 \| 503; title; body; actions: ActionRef[]; contact?: ContactChannel[]` | S | 003 T009 |
| EmptyState | `title; body?; action?: ActionRef; icon?` | S | 003 T009 |
| PreviewBanner | `label; exitHref; exitLabel` (sticky top, high contrast) | S | 003 T009 |
| FormSuccess | `title; body; action?: ActionRef` (focus target, `role="status"`) | S | 003 T009 |
| ConsentBanner | `texts; onAcceptAll; onRejectAll; onCustomize` (non-modal, bottom) | C | 004 T020 |
| ConsentPreferences | `texts; categories: { id; label; description; locked? }[]; value; onSave; open; onOpenChange` (Radix Dialog) | C | 004 T020 |

## Icons

`Icon` (`name: IconName; size?: 16 | 20 | 24 | 48; mirror?: boolean; title?`) — decorative by default
(`aria-hidden`), named when `title` given. Set: arrow, chevron, plus, minus, check, phone, mail, whatsapp,
clock, location, upload, calendar, briefcase, award, link, x-logo, linkedin, instagram, globe-check,
technology-scan, local-content, licensed-global, graduation, trending-up, users, scale, file-pdf, play, pause,
menu, close, and the sector icons used on the approved Sectors page. Sources: homepage icons `411:3741`,
`411:3748`, `411:3763`; sector icons `551:1188`; exported from Figma (R11).
