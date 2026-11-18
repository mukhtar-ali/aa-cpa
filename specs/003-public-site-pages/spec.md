# Feature Specification: Public Site Pages Wired to the CMS

**Feature Branch**: `003-public-site-pages`

**Created**: 2026-11-18

**Status**: Draft

**Owner**: agy (UI). Reviewer: Claude.

**Input**: User description: "Build the twelve approved public pages in Arabic and English from the design system
(001) and the content API (002), with working forms, the estimator, previews and instant updates when editors
publish, replacing the starter's real-estate pages."

## Context

Feature 001 delivers the components; feature 002 delivers content, forms and contracts. This feature assembles the
real website a visitor uses. Approved designs: Figma file `1jzfujyx2OJ6EKDRD2X6Xm`, page "Page 1".

### Page map

| Page | Figma | Path (`/ar/…` default, `/en/…`) | Data source (002 public API) |
| --- | --- | --- | --- |
| Home | `411:169` | `/{lang}` | `/api/pages/home` |
| About | `445:36452` | `/{lang}/about` | `/api/pages/about` |
| Services | `448:41066` | `/{lang}/services` | `/api/pages/services` |
| Service details | `448:41873` | `/{lang}/services/{slug}` | `/api/services/{slug}` |
| Sectors | `547:4555` | `/{lang}/sectors` | `/api/pages/sectors` |
| Articles | `473:36031` | `/{lang}/articles` (`?category=`, `?sector=`, `?page=`) | `/api/pages/articles`, `/api/articles` |
| Article | `506:2706` | `/{lang}/articles/{slug}` | `/api/articles/{slug}` |
| Careers | `519:38941` | `/{lang}/careers` (`?department=`) | `/api/pages/careers` |
| Job details | `514:3194` | `/{lang}/careers/{slug}` | `/api/jobs/{slug}` |
| Contact | `524:3651` | `/{lang}/contact` (`?service=`) | `/api/pages/contact` |
| Privacy policy | `525:3854` | `/{lang}/privacy` | `/api/pages/legal/privacy` |
| Terms & conditions | `525:4136` | `/{lang}/terms` | `/api/pages/legal/terms` |
| Accessibility statement | no frame — reuses the legal layout `525:3854` (design decision, client review) | `/{lang}/accessibility` | `/api/pages/legal/accessibility` |

Site chrome on every page comes from `/api/site/chrome`.

## Clarifications

### Session 2026-11-18

- Q: Keep the starter's GSAP preloader and page-transition animation (not in Figma)? → A: Remove them. Only light,
  reduced-motion-aware entrance effects from the design system remain.
- Q: Locales? → A: Arabic default + English at launch (constitution III).
- Q: Sector and case-story destinations? → A: Case stories are articles in a "case stories" category; sector links go
  to articles filtered by sector (002 Q3).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor browses the site in Arabic or English (Priority: P1)

A visitor lands on the home page (Arabic by default, or English if their browser prefers it and they have not chosen
otherwise), navigates every page through the header, footer and in-page links, and switches language on any page
without losing their place.

**Why this priority**: This is the website.

**Independent Test**: With seeded content, visit all 12 pages in both languages at phone, tablet and desktop widths;
every link resolves; the language switch keeps the equivalent page.

**Acceptance Scenarios**:

1. **Given** a first-time visitor whose browser prefers Arabic or has no preference, **When** they open the root URL,
   **Then** they land on `/ar` with right-to-left layout.
2. **Given** a visitor on `/ar/services/external-audit`, **When** they switch to English, **Then** they arrive at
   `/en/services/external-audit` and their choice is remembered for future visits.
3. **Given** any page at 1512 px, **When** compared with its Figma frame, **Then** layout, content order and styling match
   (same tolerance as 001 SC-003, photos excluded).
4. **Given** content that has no English translation yet, **When** viewed in English, **Then** the Arabic text appears
   in a correctly right-to-left block, without breaking the English page layout.

---

### User Story 2 - Visitor contacts the firm (Priority: P1)

A visitor sends the contact form (optionally pre-selected with a service when arriving from a service page) and gets
clear success or error feedback; a visitor can also call, email or WhatsApp directly.

**Why this priority**: Primary business goal (lead generation).

**Independent Test**: Submit valid/invalid forms in both languages, with keyboard only and a screen reader; check that
the lead reaches the admin portal.

**Acceptance Scenarios**:

1. **Given** a visitor clicks "Request the service" on a service page, **Then** the contact form opens with that service
   selected.
2. **Given** invalid fields, **When** submitting, **Then** errors appear next to the fields and in a summary, focus moves
   to the summary, and nothing is lost from the form.
3. **Given** a successful submission, **Then** a confirmation message replaces the form and states the response time
   promise (one working day) in the visitor's language.
4. **Given** JavaScript fails to load, **Then** the form still submits and shows the result (progressive enhancement).

---

### User Story 3 - Visitor gets an estimate and requests a quote (Priority: P2)

A visitor completes the estimator on any page that shows it, sees an indicative range, and can request a formal quote.

**Why this priority**: Differentiator; depends on the client approving prices (002).

**Independent Test**: Run the estimator flow in both languages; when the estimator is not approved, the section is
replaced by a "request a quote" call to action.

**Acceptance Scenarios**:

1. **Given** the estimator is approved, **When** the four questions are answered, **Then** a SAR range with the disclaimer
   is shown, and "Request a formal quote" creates a lead.
2. **Given** the estimator is not approved, **Then** the section shows the testimonial and a contact call to action
   instead of the widget.

---

### User Story 4 - Candidate finds and applies for a job (Priority: P2)

A candidate filters jobs by department, opens a job, reads the summary, and applies with a CV.

**Why this priority**: Supports hiring, a stated page in the approved designs.

**Independent Test**: Apply with valid and invalid CVs in both languages; closed jobs show a closed state.

**Acceptance Scenarios**:

1. **Given** a job page, **When** the candidate clicks "Apply now", **Then** the page scrolls to the application form and
   focuses its first field.
2. **Given** an upload in progress with JavaScript available, **Then** progress is visible and the submit button is
   disabled until it ends (without JavaScript the form still submits normally, without a progress bar).
3. **Given** a closed job, **Then** the form is replaced by a closed notice and links to other open jobs.

---

### User Story 5 - Reader explores articles and case stories (Priority: P2)

A reader filters articles by category, pages through results, reads an article with a table of contents, shares it,
and continues to related articles; sector links on the Sectors page lead to that sector's articles and case stories.

**Independent Test**: Filtering, pagination, sharing (copy link, X, LinkedIn, WhatsApp) and related-article navigation
work in both languages and update the URL so results are shareable.

**Acceptance Scenarios**:

1. **Given** the category "Zakat & tax", **When** selected, **Then** only matching articles show and the URL contains the
   category so the view can be shared and is indexed once.
2. **Given** an article, **When** a table-of-contents entry is activated, **Then** the page scrolls to that heading and
   the entry is marked current.

---

### User Story 6 - Editors see changes instantly and preview drafts (Priority: P2)

An editor publishes or updates content in the admin portal and sees it on the public site within a minute; before
publishing they can preview a draft exactly as it will appear.

**Independent Test**: Edit a service title, publish, and observe the public page update in under 60 seconds; open a
preview link for an unpublished article; preview links expire.

**Acceptance Scenarios**:

1. **Given** an editor publishes a change, **Then** affected pages (and lists that include the item) show it within 60 s.
2. **Given** a preview link, **Then** the draft renders with a visible "Preview" banner and is not indexable or cached.

---

### User Story 7 - Starter leftovers removed (Priority: P1)

The real-estate pages (projects, units, project slug pages, hero slider) and starter-only visuals disappear; old URLs
that might have been shared return proper not-found pages.

**Independent Test**: Old routes return the designed 404; build contains no references to removed shared types.

### Edge Cases

- API unavailable during a request: pages render the last cached version; if none, a branded error page with contact
  details is shown (never a blank page or stack trace).
- Unknown slug or unpublished item: branded 404 in the current language with links to key pages.
- Moved slug: permanent redirect to the new URL.
- Empty collections (no jobs, no articles in a category): designed empty states with a helpful next step.
- Very long Arabic names and titles; mixed Arabic/English strings (company names, SOCPA, phone numbers).
- Slow networks: images load progressively without layout shift; forms remain usable.
- Visitors with JavaScript disabled: content readable; forms submit (US2).
- Reduced motion: no marquee movement or entrance animations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST provide the 12 pages in the Page map, in Arabic (default) and English, built only from the
  001 design system and filled only from the 002 API; no visible copy hard-coded except UI chrome labels kept in locale
  dictionaries.
- **FR-002**: Language selection: default Arabic; first visit honours the browser's preferred language; the choice is
  remembered; the switcher keeps the equivalent page and query.
- **FR-003**: URLs use readable ASCII slugs shared across both languages; moved slugs redirect permanently; listing
  filters and pagination are reflected in the URL.
- **FR-004**: Header navigation marks the current section; the mobile navigation from 001 is used below the desktop
  breakpoint; the floating WhatsApp button appears on all pages except while a form field is focused on small screens.
- **FR-005**: Forms (contact, job application, estimator quote) MUST validate on the client with the shared rules, show
  server errors per field, work without JavaScript, protect against double submission, and include the anti-spam fields
  required by 002.
- **FR-006**: The estimator section appears on Home, About, Services, Service details, Sectors and Articles (as in
  Figma) and only when the estimator is approved; otherwise a contact call to action takes its place.
- **FR-007**: Pages MUST show updates within 60 s of publishing (on-demand revalidation from 002) and serve cached
  pages when the API is slow or down.
- **FR-008**: Draft preview MUST be supported via time-limited links, with a visible preview banner, no indexing and no
  caching.
- **FR-009**: Designed states MUST exist for 404, 500/maintenance, empty lists, form success, closed job, and estimator
  unavailable; Figma does not include them, so they follow the 001 visual language and are reviewed by the client.
- **FR-010**: The starter's real-estate pages, components, hero slider, and any unused starter visuals MUST be removed;
  the starter preloader and page-transition animations (GSAP) MUST be removed (decided 2026-11-18).
- **FR-011**: Each page MUST expose the data needed by feature 004 (titles, descriptions, images, breadcrumbs, dates)
  through a single page-metadata function so SEO can be completed without page rewrites.
- **FR-012**: Tracking (page views, form submissions, estimator completion, outbound phone/WhatsApp/email clicks) MUST be
  emitted through one analytics helper so 004 can connect consented analytics.
- **FR-013**: Accessibility WCAG 2.2 AA on every page: skip link, landmarks, one H1, logical heading order, focus
  management on route change, accessible forms and errors.
- **FR-014**: Image alt text and dimensions MUST come from the CMS; missing alt text on a meaningful image is reported in
  development builds.

### Key Entities

Uses 002 web contracts; no new entities. Page-level view state only: language preference (cookie), estimator answers
(in memory), form drafts (not persisted).

## Success Criteria *(mandatory)*

- **SC-001**: All 12 pages match their Figma frames at 1512 px (client sign-off per page) and pass review at 360, 768 and
  1024 px in both languages.
- **SC-002**: Lighthouse mobile ≥ 90 for Performance, Accessibility, Best Practices and SEO on every page template; Core
  Web Vitals at p75: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
- **SC-003**: 0 serious/critical automated accessibility issues across all pages; full keyboard completion of every
  form.
- **SC-004**: A published change appears on the public site in under 60 s in 95% of cases.
- **SC-005**: 100% of end-to-end journeys pass: language switch, contact, quote request, job application, article filter
  + read, preview, 404.
- **SC-006**: A visitor can complete the contact form in under 90 seconds on a phone (usability test with 5 people).

## Assumptions

- 001 is merged (components, tokens, reference homepage) and 002's public API and contracts are merged before page work
  starts; until then pages can be built against 002's seeded staging API or fixtures.
- English copy is provided by the team as a draft and approved by the client before launch (tracked in 004).
- The `/news` path from the starter is replaced by `/articles`; any old `/news/*` links redirect.
- Photos are supplied by the client through the CMS; placeholders are acceptable until content entry (004).
- Arabic is the default for search engines (`x-default` points to Arabic).

## Dependencies & Scope

- **In scope**: page routes, data fetching and caching, forms wiring, estimator wiring, preview/revalidation endpoints in
  the web app, designed states, removal of starter pages, analytics hook points, page metadata function.
- **Out of scope**: SEO details (structured data, OG images, sitemap content), consent banner and analytics vendor setup,
  production deployment (all 004); admin screens (002).
- **Depends on**: 001 merged; 002 US1 (contracts) and US2 (public API) merged; 002 US3–US5 for form submission.
