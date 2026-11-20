# Node map for Phase 6b sections (from Figma get_metadata, 2026-11-20)

Do NOT call get_metadata on a whole page frame again: the output is hundreds of KB. Call `get_design_context` on the small nodes below
(pass `excludeScreenshot: true`). Shared chrome on every page: utility bar (`445:40612` pattern), Header instance, Page title instance (PageHero
445:40591 pattern, 1512x420), Estimator, Partner quote band, Footer.

## Services (448:41066), 1512 x 5379
| Node | What |
| --- | --- |
| `448:41194` Page title (y133, 420 high) | PageHero |
| `448:41771`, `448:41808`, `448:41816`, `448:41824`, `448:41832` "Service card (accent-gold)" (1140x400 each, y 888, 1312, 1736, 2160, 2584) | ServiceCard: photo slot 429x336 at x32 (inline end), title 556x56 (H2), text 547x60, button 160x48; last card has a 2-line title |
| `448:41848` "Group 12" (y3023) | SlideCounter: text "01 / 05" (36x21) at the end, a 248x2 track and a 68x2 active line |
| `448:41195` Group 11 (y553, 2571 high) | intro paragraph `448:41226` (1140x190) on the ribbon background |
| `448:41408` Partner quote band, `448:41136` Estimator, `448:41193` Footer | shared |

## Service details (448:41873), 1512 x 5861
| Node | What |
| --- | --- |
| `448:41952` Page title + `448:42801` Button (186,409) | PageHero with action |
| `448:41953` Group 11 (y553, 802) | intro `448:42008` (1140x469), "who needs this service" heading `448:42701` + text `448:42700` |
| `448:42728` Group 1 (y1355, 1472) | MethodologyList: heading `448:42758` "منهجيتنا"; rows `448:42773` (71), `448:42778` (109), `448:42784` (109), `448:42788` (109), `448:42792` (169), `448:42796` (198) "Line-up row" instances |
| `448:42994` Card talk to an expert (558x324, dark ribbons, icon 64, H4 title, text, button) and `448:43007` Card explore FAQ (light) | CtaCards; heading `448:43016` |
| `462:2416` Section FAQ (y2833, 773) | FaqAccordion: heading `462:2417`; items `463:3590` (open, 115 high), `463:3596`, `463:3603`, `463:3610`, `463:3617` (97 collapsed) |

## Blog (473:36031): empty frame in the file (children are not exposed); use FeaturedNews (`473:36031` featured block, `501:1155` compact card) via design_context.

## Article (506:2706), 1512 x 4284
| Node | What |
| --- | --- |
| `506:2785` breadcrumb text, `506:3929` Filter chip (category), `506:3931` title (900x134), `506:3932` author avatar 52, `506:3933` name, `506:3934` date and reading time | ArticleHeader |
| `506:3936/3940/3944/3949` Share buttons 44x44 (link, WhatsApp, LinkedIn, X) + `506:3935` label | ShareBox inline |
| `506:3952` Cover image 1140x480 | |
| `509:3025` Article card (752x1510): intro `506:3955`, H2 `506:3956`, paragraph `506:3957`, Pull quote `506:3958` (656x150), numbered H2 `506:3961`, list items with 8px green dots `506:3962..3969`, inline image `506:3970` (656x340) + caption `506:3972` (18 high), H2 `506:3973`, closing text, Share bar `506:3982` (656x96), tags `507:4169`, `507:4171`, `507:4173` (40 high pills) | ArticleBody |
| `506:4001` TOC card (364x260): title, numbered items 01-04 with 1px dividers, `507:3022` active indicator 3px at the inline start | TableOfContents |
| `506:4011` Share card (364x230, dark ribbons): title, 4 share buttons 44, `506:4072` link field 316x52 with Copy button 80x40 | ShareBox dark |
| `506:4076` Author card (364x200): avatar 56, name, role, bio | AuthorCard |
| `506:4135` Related slider (y2614, 782): heading `530:4363`, viewport `511:2983` with cards 267x414, Next `529:4428`, Prev `529:4431` (48), counter `511:3014`, track `511:3015` 248x2, active `511:3016` | RelatedCarousel |

## Still to locate (not yet read): careers list (512:1159 JobRow), job details (514:3194 summary, apply form), hiring steps (519:38941, 529:4296 perks), contact (524:3651 form, 527:5423, 529:4280, 578:1293 offices/map), sectors (547:4555 index and case stories), legal (525:3854, 525:4136).
