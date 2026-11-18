# Feature Specification: AA-CPA Public Design System

**Feature Branch**: `001-design-system`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Build a reusable, token-driven, bilingual (Arabic RTL default + English LTR) UI
component library for the AA-CPA public website, derived from the approved Figma 'Page 1' frames, documented
in a component workbench with every variant/state, plus a reference composition of the approved homepage using
mock data to prove parity. UI only; later features wire to the API." (full brief: see Figma Sources and
Component Inventory below)

## Context

The client, Abdulrahman Al-Shubaishiri Professional Consulting (SOCPA licence 522, member of 3E Accounting),
has approved a set of page designs in Figma. Before any page is wired to real content, the team needs one
shared library of visual building blocks so that all twelve page templates look identical to the approved
designs, work in Arabic and English, and stay consistent when content changes.

### Figma sources (approved, file `1jzfujyx2OJ6EKDRD2X6Xm`, page "Page 1" only)

| Page | Node | Notes |
| --- | --- | --- |
| Homepage – with logo lines | `411:169` | **Approved homepage.** Frame `1:2` "Homepage" is NOT approved. |
| About Us | `445:36452` | |
| Services | `448:41066` | Cards `473:36122`, `473:36200` (talk to expert / FAQ) are reused on Service Details |
| Service Details | `448:41873` | |
| Blog (Articles) | `473:36031` | |
| Article details | `506:2706` | |
| Careers | `519:38941` | |
| Job details | `514:3194` | |
| Contact | `524:3651` | |
| Privacy Policy | `525:3854` | |
| Terms & Conditions | `525:4136` | Same layout as Privacy Policy |
| Sectors · القطاعات | `547:4555` | Approved. `552:4605` "Sectors — Redesign" is NOT approved. |

## Clarifications

### Session 2026-11-18

- Q: Which Sectors page is approved? → A: "Sectors · القطاعات" (`547:4555`); the Redesign (`552:4605`) is not.
- Q: Which pages are approved? → A: Only frames on Figma "Page 1"; homepage is "Homepage – with logo lines".
- Q: Locales at launch? → A: Arabic (default, RTL) and English (LTR).

Design tokens are published as Figma variables on these frames (colour, typography, spacing, effects) and are
the single source for the library's visual values.

## User Scenarios & Testing *(mandatory)*

Actors: **Site visitor** (Arabic- or English-speaking business owner, CFO, job candidate), **Developer**
(builds pages from the library), **Client reviewer / designer** (approves visual parity).

### User Story 1 - Brand foundations match Figma (Priority: P1)

A developer applies the brand's colours, Almarai typography scale, spacing, radii, shadows, section background
tones and decorative patterns through named tokens, and a reviewer can see every token rendered next to its
Figma name and value.

**Why this priority**: Every other component depends on the tokens; wrong foundations multiply errors across
all pages.

**Independent Test**: Open the workbench's "Foundations" pages and compare each swatch, type specimen and
spacing sample with the Figma variable list; all names and values match.

**Acceptance Scenarios**:

1. **Given** the Figma variable list, **When** the reviewer opens the Foundations colour page, **Then** every
   Figma colour variable appears under the same semantic name with the identical value.
2. **Given** the type specimen in Arabic and English, **When** compared with Figma text styles (H1–H6, body
   lg/md/sm/xs in regular/bold/extra-bold), **Then** family, size, line height and weight match.
3. **Given** any page or component, **When** its styles are inspected, **Then** no colour, font size or spacing
   value is used that is not a token.

---

### User Story 2 - Core primitives and forms, bilingual and accessible (Priority: P1)

A developer composes interfaces from primitives (buttons, links, icons, chips, badges, pills, avatars, rating,
breadcrumbs, pagination, logo, language toggle) and form controls (text input, textarea, select, checkbox,
file upload, field wrapper), each with all variants and states, working in Arabic (RTL) and English (LTR), by
keyboard and screen reader.

**Why this priority**: Primitives and forms appear on every page and carry the accessibility and bilingual
obligations; contact and job application conversions depend on them.

**Independent Test**: In the workbench, switch each primitive between AR/EN and every state; operate it using
only the keyboard; run automated accessibility checks with zero serious/critical issues.

**Acceptance Scenarios**:

1. **Given** a Button in any style (primary, secondary/paper, outline on dark, link with arrow) and size,
   **When** hovered, focused, pressed, disabled or loading, **Then** it shows the defined visual state and
   focus is clearly visible.
2. **Given** the locale switches from Arabic to English, **When** a component with a directional icon (arrow,
   chevron, slider control, "read more") renders, **Then** layout and icon direction mirror correctly.
3. **Given** a required field left empty or invalid, **When** the form is validated, **Then** the field shows
   the error state, the message is linked to the field and announced by assistive technology.
4. **Given** the file upload control, **When** a user drags or selects a PDF/DOCX up to 5 MB, **Then** the
   control shows the uploaded state with file name and a way to remove it; other types or larger files show
   an error message.

---

### User Story 3 - Site chrome: utility bar, header, mobile navigation, footer (Priority: P1)

A visitor sees the same utility bar (licence, network membership, city, phone, language toggle), header (logo,
navigation with active state, "request a quote" CTA) and footer (logo, description, social links, quick
links, services, offices, phone/email, legal row, back to top, wordmark) on every page, and on small screens
can open an accessible navigation menu.

**Why this priority**: The chrome is on every page and is the first thing the client reviews.

**Independent Test**: Render header and footer at 360, 768, 1024 and 1512 px widths in both languages;
navigate menus by keyboard; compare 1512 px rendering against Figma `411:169`.

**Acceptance Scenarios**:

1. **Given** a viewport narrower than the desktop breakpoint, **When** the visitor activates the menu button,
   **Then** a navigation panel opens, traps focus, closes with Escape or the close button, and returns focus.
2. **Given** a navigation item matching the current page, **When** the header renders, **Then** that item shows
   the active state and is exposed as the current page to assistive technology.
3. **Given** the visitor activates "back to top" in the footer, **Then** the page returns to the top (instantly
   when reduced motion is preferred).

---

### User Story 4 - Content components and page sections (Priority: P2)

A developer builds any of the twelve approved page templates entirely from library sections: page hero,
section heading, statement text, stats, feature/pillar cards, service tabs, service cards, process steps,
timeline stepper, methodology rows, logo marquee and credential grid, photo-quote CTA band, CTA cards, FAQ
accordion, news cards and featured news, article body, table of contents, author card, share box, job rows and
job summary, perk tiles, office cards, contact items, map with pins, sector cards/tabs/detail panel/index rows,
case story cards, testimonial, fee estimator, legal document layout, floating WhatsApp button.

**Why this priority**: These sections make the pages; they depend on Stories 1–3.

**Independent Test**: For each section, the workbench shows all variants in AR and EN with realistic mock
content, long-text and missing-optional-content cases; each passes accessibility checks.

**Acceptance Scenarios**:

1. **Given** the logo marquee, **When** the visitor prefers reduced motion or activates pause, **Then** movement
   stops; logos remain reachable and named.
2. **Given** the FAQ accordion, **When** a question is activated by mouse or keyboard, **Then** its answer
   expands, the expanded state is announced, and the plus/minus indicator updates.
3. **Given** the fee estimator, **When** the visitor answers each of the four questions, **Then** progress
   ("question n of 4" and bar) advances, values are formatted as Saudi riyal amounts in the active locale, and
   the result step shows an indicative figure with the disclaimer.
4. **Given** the service tab list on the homepage, **When** a different service is selected, **Then** the image,
   title, description and link update and the selection is exposed as a tab state.
5. **Given** the table of contents on an article or legal page, **When** the visitor scrolls to a section,
   **Then** the matching entry becomes active; activating an entry moves to that section.

---

### User Story 5 - Reference homepage proves parity (Priority: P2)

A client reviewer opens a reference composition of the approved homepage built only from library components
with mock content, in Arabic and English, and confirms it matches Figma `411:169` at 1512 px and behaves well
on phones and tablets.

**Why this priority**: It is the acceptance gate that proves the library is complete and faithful before
real pages are built.

**Independent Test**: Side-by-side comparison with the Figma export at 1512 px; responsive review at 360,
768 and 1024 px; automated accessibility and performance checks.

**Acceptance Scenarios**:

1. **Given** the reference homepage at 1512 px in Arabic, **When** overlaid on the Figma export, **Then** section
   order, spacing, typography, colours and imagery placement match within the tolerance in SC-003.
2. **Given** the same page in English, **Then** all sections mirror correctly with no clipped or overlapping text.

---

### User Story 6 - Workbench documentation for the team (Priority: P3)

A developer or designer browses a component workbench listing every component with its Figma node link,
props, variants, states, do/don't notes and AR/EN toggle.

**Why this priority**: Speeds future page work and client reviews; not required for visitors.

**Independent Test**: Every exported component has a workbench entry with a Figma reference and both locales.

**Acceptance Scenarios**:

1. **Given** any component, **When** opened in the workbench, **Then** its Figma node reference, all variants and
   states, and an AR/EN switch are present.

### Edge Cases

- Very long Arabic or English titles (e.g. article titles, sector names) wrap without overflowing cards or
  breaking alignment; card grids keep equal heights.
- Optional content missing (no image, no eyebrow, no description, no CTA, empty list): the component renders
  cleanly without empty gaps, and lists render nothing or a defined empty state.
- Mixed-direction text (English brand names like "3E Accounting", "SOCPA", phone numbers, emails, URLs inside
  Arabic text) displays in the correct order.
- Numbers in stats and the estimator: Western digits by default in both locales (as in Figma); formatting via
  locale rules, including thousands separators and currency.
- Images fail to load or have unusual aspect ratios: placeholders keep layout stable (no layout shift).
- Reduced motion preference: marquees, scroll/entrance animations, and smooth scrolling are disabled.
- Keyboard-only and 200% zoom: all content and controls remain reachable without horizontal scrolling at 320 px
  CSS width.
- Credential grid with fewer real logos than slots: empty placeholder cells are not shown to visitors.
- Copy-link share action when clipboard access is denied: user receives a fallback message.

## Requirements *(mandatory)*

### Functional Requirements

**Foundations**

- **FR-001**: The library MUST expose every Figma colour, typography, spacing and effect variable as a named
  token with the same semantic name and value (colour set includes bg/hero, bg/page, bg/surface,
  bg/surface-ice, bg/inverse, bg/inverse-raised, text/heading, text/body, text/strong, text/muted,
  text/inverse, text/inverse-muted, text/link, text/on-action, action/primary, action/secondary,
  accent/progress, icon/accent, border/subtle, border/decor, border/strong, border/inverse,
  border/inverse-strong, pine/200, pine/700, pine/900 and the emerald→blue gradient).
- **FR-002**: Typography MUST use the Almarai family with the Figma scale: H1 48/67, H2 40/56, H3 33/46,
  H4 28/39, H5 23/32, H6 19/27 (bold); body lg 19/30, md 16/26, sm 13/21, xs 11/18 (regular, bold,
  extra-bold), with defined smaller sizes for tablet and phone.
- **FR-003**: Spacing MUST follow the Figma scale (0, 8, 16, 24, 48, 64, 80, 96) plus documented derived steps
  for small components where Figma uses intermediate values; radii and shadows MUST be tokens.
- **FR-004**: The library MUST provide section background tones (page cream, ice, surface white, inverse dark
  green, hero navy) with optional rounded top/bottom edges, and decorative patterns (flow lines, dots grid,
  logo-mark lines) that are purely decorative and hidden from assistive technology.
- **FR-005**: A token pair used for text MUST meet WCAG 2.2 AA contrast; the library MUST document any Figma
  pair that fails and the accessible substitute used.

**Primitives**

- **FR-010**: Button MUST support styles primary, secondary (paper), outline-on-dark, and link-with-arrow; sizes
  md and lg; states default, hover, focus, pressed, disabled, loading; optional leading/trailing icon; render as
  a link or a button.
- **FR-011**: The library MUST provide: round icon button (share X, LinkedIn, WhatsApp, copy link; slider
  previous/next), icon set (sector icons, arrow, chevron, check, plus, minus, phone, mail, WhatsApp, clock,
  location, upload, calendar, briefcase, social), heading with optional gradient-accent second line, eyebrow
  label, tag/chip, filter chip (default/selected), meta pill (location, contract, experience, date), category
  badge with dot, divider, avatar, rating stars, text link, breadcrumbs, numbered pagination, slide counter with
  progress, logo (on dark, on light), language toggle.
- **FR-012**: Directional icons and layouts MUST mirror automatically between RTL and LTR; non-directional
  icons MUST NOT mirror.

**Forms**

- **FR-020**: The library MUST provide text input, textarea, select, consent checkbox and file upload, each
  inside a field wrapper with label, required marker, help text and error message, with states default,
  focus, filled, error, disabled, in light and dark (estimator) themes.
- **FR-021**: File upload MUST accept drag-and-drop and file picker, show accepted types and maximum size
  (default PDF/DOCX up to 5 MB, configurable), show the uploaded state with remove action, and show a clear
  error for rejected files.
- **FR-022**: Validation errors MUST be associated with their fields and announced to assistive technology;
  a form-level error summary MUST be available for submit failures.

**Layout and chrome**

- **FR-030**: Utility bar, header (nav links default/active, CTA), and footer MUST match Figma `411:169` and
  accept all text, links, contact details, social links and offices as content inputs.
- **FR-031**: Below the desktop breakpoint, the header MUST collapse into a menu button that opens an
  accessible navigation panel (focus trap, Escape to close, focus return) designed in the established visual
  language, because Figma has no mobile design; the design MUST be reviewed by the client before sign-off.
- **FR-032**: The library MUST provide a page container with consistent maximum width and side gutters, and a
  dark photo page hero (title, subtitle, optional CTA, optional breadcrumb).

**Content components and sections**

- **FR-040**: The library MUST provide these sections, each with the variants observed in Figma: section
  heading (light/dark, optional eyebrow, gradient line, description, action), statement text, stat tile and
  stats strip (light/dark), feature/pillar card (light/dark, with icon), service tab list with image and
  floating stat card, horizontal service card, numbered process step card, timeline stepper, methodology rows,
  logo marquee (two rows, opposite directions) and credential logo grid, photo-quote CTA band, CTA cards
  (dark "talk to an expert", light "explore FAQ"), FAQ accordion, news card, compact article card, featured
  news block, article body typography (headings, paragraphs, lists, pull quote, figure with caption, tags),
  table of contents with active state, author card, share box with copy link, job row, job summary card
  (dark), perk tile, office card with map link, contact item (phone, email, WhatsApp, hours), static map with
  location pins, sector card grid (with one highlighted state), sector tabs with sector detail panel, sector
  index rows, case story card, testimonial, legal document layout (contents, summary box, numbered sections,
  "have a question" card with document download), floating WhatsApp button. Sector components MUST cover
  the approved Sectors design `547:4555` ("Sectors · القطاعات"): sector index rows, the sector photo-quote
  band and case story cards. The "Redesign" frame `552:4605` is NOT approved; its sector card grid, sector
  tabs and detail panel are out of scope.
- **FR-041**: The fee estimator MUST present four sequential questions with "question n of 4" text and a
  progress bar, numeric currency input formatted in the active locale, next/back controls, a disclaimer, and
  a result step showing an indicative figure; questions, options and calculation are supplied as inputs (the
  pricing logic is defined in a later feature). The result step offers an optional "Request a formal quote"
  action that reveals a short form (name, mobile, email, consent) inside the estimator card; no personal data is
  asked before the result is shown (decision from spec 002, Q2).
- **FR-042**: Logo marquee and any auto-moving content MUST be pausable and MUST stop when reduced motion is
  preferred; all entrance animations MUST be disabled under reduced motion.
- **FR-043**: Interactive components (tabs, accordion, menus, carousels, estimator, copy link, TOC) MUST follow
  the WAI-ARIA Authoring Practices keyboard patterns.

**Cross-cutting**

- **FR-050**: Every component MUST receive all content through inputs (no built-in copy other than accessible
  labels supplied by the caller), MUST NOT fetch data, and MUST display its full content without
  client-side scripting unless the component is inherently interactive.
- **FR-051**: Every component MUST reference its Figma node in its documentation.
- **FR-052**: Every component MUST be responsive from 320 px to 1920 px; at 1512 px it MUST match Figma.
- **FR-053**: The workbench MUST show every component in every variant and state in Arabic and English.
- **FR-054**: Every component MUST have automated tests for rendering, variants, RTL/LTR and keyboard behaviour
  and an automated accessibility check.
- **FR-055**: A reference homepage composition built only from library components with mock bilingual content
  MUST be available for review.
- **FR-056**: Images MUST reserve their aspect ratio before loading and require alternative text input (or an
  explicit decorative flag).

### Key Entities *(UI data shapes the components accept; persistence is out of scope)*

- **Navigation item**: label, destination, active flag, optional children.
- **Office**: city, address, map link, optional photo.
- **Contact channel**: type (phone, email, WhatsApp, hours), label, value, link.
- **Service summary**: title, short description, image, link, optional stat.
- **Sector summary**: icon, number, title, description, tags, challenges, offerings, image, links.
- **Stat**: value, label, optional suffix/prefix.
- **Article summary**: title, category, date, image, reading time, link, author.
- **Job summary**: title, department, city, contract type, experience, posted/closing dates, link.
- **Testimonial**: quote, rating, person name, role, company, avatar.
- **FAQ item**: question, answer.
- **Logo**: name, image, optional link.
- **Estimator question**: prompt, input type, options/range, unit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the Figma variables used on the approved frames are available as tokens with matching
  names and values; 0 raw visual values in pages built from the library.
- **SC-002**: 100% of the components listed in FR-010 to FR-043 exist with workbench entries in both
  languages, Figma references, and passing tests.
- **SC-003**: The reference homepage at 1512 px matches Figma `411:169`: section order identical, element
  positions within 4 px, colours identical, and the client reviewer signs off with no blocking visual issues.
- **SC-004**: Automated accessibility checks report 0 serious or critical issues across all components and the
  reference homepage; all interactive components are fully operable by keyboard.
- **SC-005**: The reference homepage on a mid-range phone over a 4G connection reaches largest content visible
  in under 2.5 s, layout shift score under 0.1, and responds to interactions in under 200 ms.
- **SC-006**: Switching between Arabic and English produces correct mirroring with 0 clipped, overlapping or
  misordered text on the reference homepage at 360, 768, 1024 and 1512 px.
- **SC-007**: A developer can build a new section-level page from the library without writing new visual
  styles (verified when pages are built in feature 003: fewer than 5% of new styles outside the library).

## Assumptions

- Figma is desktop-only (1512 px). Tablet and phone layouts, the mobile navigation panel, hover/focus states and
  empty/error states are designed by the team in the same visual language and submitted for client review.
- Almarai (open licence) is used for both Arabic and Latin text, as in Figma.
- Western (0–9) digits are used in both locales, matching Figma; dates follow locale formatting.
- Imagery in Figma (portraits, stock photos, client logos) is treated as placeholder content supplied through
  inputs; final, licensed images come from the client via the CMS (some Figma images carry watermarks and
  MUST NOT ship).
- English copy is not in Figma; the workbench and reference page use provisional English translations until
  the client supplies approved copy (feature 003).
- The estimator's questions and pricing formula are defined with the client in the backend feature; this
  feature only provides the UI flow with mock configuration.
- Credential logos beyond SOCPA and 3E Accounting are placeholders in Figma; empty slots are hidden in
  production.
- The admin portal keeps its own existing component set; this library serves the public website only.
- Light theme only; the site does not follow the operating system's dark mode (the design uses fixed light and
  dark sections).

## Dependencies & Scope

- **In scope**: tokens, primitives, forms, layout/chrome, content sections, workbench documentation, tests,
  reference homepage with mock content.
- **Out of scope** (later features): removing the real-estate domain and the new CPA data model and API (002),
  building and routing the twelve real pages with live CMS data, SEO and analytics (003), admin CMS screens
  (004).
- **Depends on**: approved Figma "Page 1"; client review of the team-designed mobile navigation (FR-031).
