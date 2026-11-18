# Feature Specification: CPA Content & Lead Backend

**Feature Branch**: `002-cpa-content-backend`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Wire the AA-CPA site to a backend: remove the real-estate domain (Projects, Units,
Inquiries) and provide the bilingual content model, public read API, admin management API and lead capture
(contact, job applications, fee estimator) needed by the twelve approved pages. Publish shared contracts first
so the UI (feature 001, built by agy) and the backend agree on data shapes."

## Context

The repository started as a real-estate starter. The client is an audit and advisory firm. Every block on the
approved pages (Figma "Page 1") must be editable by the firm's staff in Arabic and English (constitution V), and
the site's forms must deliver leads and candidates to the right people with consent (constitution VIII).

Content observed on the approved pages:

| Page | Editable content |
| --- | --- |
| Home `411:169` | hero, gap statement, client logos, service highlights, reasons + stats, credentials, process steps, partner quote, latest articles, estimator, testimonial |
| About `445:36452` | hero, statement, licence text, credentials, client logos, partner/signatory block, three commitments, offices, partner quote, estimator |
| Services `448:41066` | hero, intro statement, five services (title, summary, image), partner quote |
| Service details `448:41873` | per service: hero, statement, who needs it, methodology rows, what you receive, why us, CTA cards, FAQs |
| Sectors `547:4555` | hero, statement, eight sectors (title, one-line description), client logos, featured sector band, case stories |
| Articles `473:36031` | featured articles, category filters, paginated list |
| Article `506:2706` | category, title, author, date, reading time, cover, body, tags, related articles |
| Careers `519:38941` | hero, perks, team section with stats and quote, photos, job list with filters, hiring steps |
| Job details `514:3194` | job summary, responsibilities, requirements, benefits, application form, similar jobs |
| Contact `524:3651` | contact channels, hours, social links, contact form, offices map, contact FAQs |
| Privacy / Terms `525:3854`, `525:4136` | last updated, summary, numbered sections, downloadable PDF |
| All pages | utility bar, header nav, footer, SEO metadata, sharing images |

## Clarifications

### Session 2026-11-18

- Q: Real-estate modules? → A: Remove Projects, Units, Inquiries; keep auth, users, RBAC, CMS sections, News,
  Careers, Contact, SEO, uploads, email, monitoring.
- Q: Locales? → A: Arabic default + English at launch.
- Q: Sectors page? → A: `547:4555` (sector index rows, featured sector band, case stories).
- Q1: Estimator pricing source? → A: The team drafts the questions and fee bands for a Saudi mid-market audit
  firm, clearly marked as draft; the client reviews and edits them in the admin before launch.
- Q2: Capture visitor details at the estimator? → A: No. The estimate is shown anonymously; an optional
  "Request a formal quote" form (name, mobile, email, consent) creates a contact request pre-filled with the
  answers.
- Q3: Sector and case-story detail destinations? → A: Reuse templates. Case stories are Articles in a
  "case stories" category (Article page); sector links go to Articles filtered by sector or a related Service page.

## User Scenarios & Testing *(mandatory)*

Actors: **Visitor** (prospective client), **Candidate**, **Content editor** (firm staff), **Partner / HR
reviewer** (receives leads and applications), **Administrator** (manages users and permissions).

### User Story 1 - Shared contracts published (Priority: P1)

The UI team and the backend team use one agreed definition of every content item and form submission, so pages
built from the design system can display API data without reshaping it ad hoc.

**Why this priority**: Unblocks parallel work (UI by agy, backend by Claude) and prevents integration rework.

**Independent Test**: Every view model in `specs/001-design-system/data-model.md` maps to a published contract
or a documented mapper; contract validation tests accept the sample data used by the design system's stories.

**Acceptance Scenarios**:

1. **Given** the published contracts, **When** the design system's mock content is validated against them,
   **Then** it passes or the documented mapper converts it without loss.
2. **Given** a contract change, **When** it is proposed, **Then** both teams see it in one place and versioned review.

---

### User Story 2 - Visitors see editable bilingual content (Priority: P1)

A visitor opening any approved page in Arabic or English sees the firm's current content (services, sectors,
articles, jobs, offices, testimonials, logos, stats, FAQs, legal pages, page-level texts and SEO).

**Why this priority**: Without it the site cannot launch.

**Independent Test**: Seed demo content; request each page's data in both languages; every block in the Context
table is returned; unpublished items never appear.

**Acceptance Scenarios**:

1. **Given** a published service with Arabic and English text, **When** its detail is requested in English,
   **Then** English text, its methodology, deliverables, FAQs and SEO data are returned.
2. **Given** content missing an English translation, **When** requested in English, **Then** the response follows
   the fallback rule (FR-012) and never errors.
3. **Given** articles filtered by category and page 2, **Then** results, total count and featured items are
   correct and ordered by publish date.
4. **Given** an item is unpublished or scheduled in the future, **Then** it is not visible publicly.

---

### User Story 3 - Visitor submits a contact request (Priority: P1)

A visitor fills in name, company, mobile, email, required service and message, accepts the privacy consent and
submits; the firm is notified and the visitor sees confirmation.

**Why this priority**: Primary lead channel.

**Independent Test**: Submit valid and invalid requests; valid ones are stored with consent and notify the
configured recipients; invalid ones return field-level errors in the visitor's language.

**Acceptance Scenarios**:

1. **Given** a valid submission with consent, **Then** it is stored as "new", recipients for the selected service
   are emailed, and the visitor receives an acknowledgement email in their language.
2. **Given** consent not given, **Then** the submission is rejected with a localized message.
3. **Given** automated spam (honeypot filled or rate exceeded), **Then** it is rejected without notifying staff.

---

### User Story 4 - Candidate applies for a job (Priority: P2)

A candidate submits full name, email, mobile, optional LinkedIn URL, CV (PDF/DOCX ≤ 5 MB), optional motivation and
consent for a published, open job.

**Why this priority**: Required by Careers and Job pages; less frequent than leads.

**Independent Test**: Apply with valid/invalid files and closed jobs; valid applications are stored privately,
HR is notified, candidate is acknowledged.

**Acceptance Scenarios**:

1. **Given** an open job and a valid CV, **Then** the application is stored, the CV is kept in private storage,
   HR is notified, and the candidate gets an acknowledgement.
2. **Given** a job past its closing date, **Then** applications are refused with a clear message.
3. **Given** an executable or oversized file, **Then** it is refused before storage.

---

### User Story 5 - Visitor gets an indicative fee estimate (Priority: P2)

A visitor answers the estimator's questions and receives an indicative fee range with a disclaimer, then can
request a formal quote.

**Why this priority**: Differentiating feature shown on most pages; depends on the firm's pricing input.

**Independent Test**: For configured inputs, the returned range equals the firm's pricing table; editors can
change questions and pricing without code changes.

**Acceptance Scenarios**:

1. **Given** the four answers, **When** the estimate is requested, **Then** a range in SAR and the disclaimer are
   returned in the visitor's language.
2. **Given** an editor changes a pricing band, **Then** new estimates use it immediately.
3. **Given** the visitor chooses to request a quote, **Then** a short form (name, mobile, email, consent) creates a
   contact request pre-filled with the estimator answers and the shown range.
4. **Given** a visitor only views an estimate, **Then** no personal data is stored; only anonymous usage counts.

---

### User Story 6 - Staff manage content, leads and applications (Priority: P2)

Editors create, edit, reorder, publish/unpublish and preview all content types in both languages; reviewers
manage contact requests and applications through statuses and notes; administrators assign permissions.

**Why this priority**: The client must run the site without developers (constitution V).

**Independent Test**: For each content type, an editor with the right permission performs create → translate →
publish → reorder → unpublish; a user without permission is refused.

**Acceptance Scenarios**:

1. **Given** an editor without permission for jobs, **When** they try to edit a job, **Then** the action is refused.
2. **Given** a reviewer opens a contact request, **Then** they can change status (new → contacted → closed), add
   internal notes, and see the consent record.
3. **Given** a candidate's CV, **When** a reviewer downloads it, **Then** access is authenticated and logged.

---

### User Story 7 - Real-estate domain removed safely (Priority: P1)

The Projects, Units and Inquiries features disappear from the API, admin, web and tests without breaking
authentication, users, CMS, articles, careers, contact, SEO, uploads, email or monitoring.

**Why this priority**: Prevents shipping irrelevant screens/endpoints and reduces attack surface.

**Independent Test**: After removal, all remaining tests pass; the removed endpoints return 404; the database
migration drops the old tables on a copy of the current database without data loss elsewhere.

**Acceptance Scenarios**:

1. **Given** the migration runs, **Then** project, unit and inquiry tables are removed and all other data is intact.
2. **Given** an admin user with old real-estate permissions, **Then** those permissions are cleaned up and the user
   can still sign in.

### Edge Cases

- Content exists in Arabic only (expected during launch) → English page shows fallback per FR-012.
- Slug changes after publication → old URL redirects to the new one.
- Two editors edit the same item → last save wins with a visible "updated by/at"; no silent data loss on
  concurrent create.
- Deleting a sector or service referenced by case stories, articles or FAQs → blocked or references cleaned, with a
  clear message.
- Email delivery fails → submission is still stored; delivery is retried and failures are visible to admins.
- Large logo/photo uploads → resized/optimized; unsupported formats refused.
- Estimator answers outside configured ranges → clamped to the nearest band or refused with a message.
- Personal-data requests (access/deletion under PDPL) → staff can export or delete a person's submissions.

## Requirements *(mandatory)*

### Functional Requirements

**Contracts**

- **FR-001**: The system MUST publish one shared definition per content type and per form submission, covering
  every view model in `specs/001-design-system/data-model.md`, before UI integration (feature 003) starts.
- **FR-002**: Public responses MUST already be localized (single language per request), matching the design
  system's "strings are localized by the caller" rule.

**Content model** (all bilingual, publishable, orderable, with SEO fields where they have a page)

- **FR-010**: Services (title, slug, summary, image, hero subtitle, statement, who-needs-it text, methodology rows,
  deliverables, why-us text, FAQs, related sectors, highlight stat, order, published).
- **FR-011**: Sectors (title, slug, one-line description, optional featured band: title, body, image, CTA),
  Case stories (title, sector, service, image, link to an article or external URL), Articles (existing News
  extended with category, author, reading time, tags, related sector/service, featured flag, cover image, scheduled
  publish), Article categories, Authors (name, role, avatar, bio).
- **FR-012**: When the requested language translation is missing, public responses MUST fall back to Arabic and flag
  the item as fallback; required fields in Arabic are mandatory to publish.
- **FR-013**: Jobs (existing model extended with department, city/office, contract type, experience, posted and
  closing dates, summary, responsibilities, requirements, benefits), Job departments for filters.
- **FR-014**: Offices (city, address, map link, map position, photo, headquarters flag, order).
- **FR-015**: Testimonials (quote, rating, name, role, company, avatar, publish), Client logos (name, logo, link,
  order, publish), Credentials (accreditation name, logo, link, order), FAQs (question, answer, scope: global,
  contact page, or a specific service), Perks (careers), Hiring steps, Process steps, Stats.
- **FR-016**: Page content blocks for each approved page (heroes, statements, intros, section headings, CTA texts,
  partner quote, careers team section) and site chrome (utility bar texts, navigation, footer columns, contact
  channels, social links, legal registry numbers) MUST be editable.
- **FR-017**: Legal pages (privacy, terms): last updated date, summary points, ordered sections, optional PDF.
- **FR-018**: Per-page SEO (title, description, social image, canonical) and global SEO/tracking MUST continue to work
  for the new pages.

**Public read API**

- **FR-020**: Public endpoints MUST return each page's data by language with caching that keeps typical page data
  responses under 300 ms at p95 and invalidates on publish.
- **FR-021**: Lists MUST support pagination, category/department filters and featured items as in the designs.

**Lead capture**

- **FR-030**: Contact submissions MUST capture full name, company (optional), mobile, email, required service,
  message, consent (timestamp, policy version, language, IP), and route notifications to recipients configured per
  service with a default inbox.
- **FR-031**: Job applications MUST capture full name, email, mobile, LinkedIn (optional), CV (PDF/DOCX ≤ 5 MB,
  private storage), motivation (optional), consent; reject closed or unpublished jobs.
- **FR-032**: Estimator MUST be configurable (questions, bands, pricing rules, disclaimer) and return an indicative
  SAR range. Launch values are a team-drafted pricing table flagged "draft" in the admin until the client
  approves it; publishing the estimator on the live site requires that approval flag.
- **FR-033**: Public submissions MUST be protected by rate limits, honeypot, server-side validation with localized
  messages, and optional CAPTCHA controlled by a setting.
- **FR-034**: Visitors and candidates MUST receive localized acknowledgement emails; staff notification emails MUST
  include a link to the item in the admin portal.

**Administration**

- **FR-040**: Every content type and submission type MUST have admin management with permissions for view, create,
  update, delete/publish, following the existing permission system.
- **FR-041**: Contact requests and applications MUST support statuses, internal notes, assignment to a staff member,
  CSV export, and PDPL data export/deletion per person (by email).
- **FR-042**: Editors MUST be able to preview unpublished content on the public site.

**Removal of real-estate domain**

- **FR-050**: Projects, Units and Inquiries MUST be removed from data, API, admin, web, shared contracts, permissions
  and tests, with a migration that preserves all other data.

### Key Entities

Service, ServiceMethodologyStep, ServiceDeliverable, Sector, CaseStory, Article (News), ArticleCategory, Author,
Tag, Job, JobDepartment, JobApplication, ContactRequest, ConsentRecord, Office, Testimonial, ClientLogo, Credential,
FaqItem, Perk, HiringStep, ProcessStep, Stat, EstimatorConfig (questions, bands, rules), EstimateRequest (if
stored), PageContent (per page blocks), SiteSettings (chrome, contact channels, socials, legal ids), LegalPage,
NotificationRecipient (per service / per inbox). Each bilingual entity has Arabic and English text; Arabic is
required to publish.

## Success Criteria *(mandatory)*

- **SC-001**: 100% of editable content listed in Context is managed in the admin portal in both languages; zero
  content changes require a developer after launch.
- **SC-002**: 100% of design-system view models map to published contracts with automated validation.
- **SC-003**: Public page data responds in under 300 ms at p95 under 50 concurrent visitors.
- **SC-004**: 100% of valid contact requests and applications are stored even when email delivery fails; staff are
  notified within 2 minutes when email works.
- **SC-005**: Spam submissions are rejected at ≥ 95% without blocking real visitors (measured over the first month).
- **SC-006**: After removing the real-estate domain, all remaining automated tests pass and no removed endpoint is
  reachable.

## Assumptions

- Existing building blocks are reused: authentication and permissions, CMS sections mechanism, News and Careers
  modules (extended, renamed in the UI to "Articles"), contact module, uploads (S3 or local), email settings and
  templates, SEO, monitoring.
- Email recipients and the default inbox (e.g. info@aacpa.sa) are configured in admin settings.
- Scheduled publish uses the server time zone `Asia/Riyadh`.
- Sector and case-story detail pages are not designed: case stories are Articles in a "case stories" category,
  and sector links resolve to Articles filtered by sector or to a related Service (Q3).
- PDPL: consent wording and policy versions are supplied by the client's legal team; retention for unsuccessful
  applications is 12 months unless the client specifies otherwise.
- Redis/BullMQ queueing (docs/redis-bullmq-plan.md) is used for email retries if available; otherwise a database
  outbox with retries.

## Dependencies & Scope

- **In scope**: shared contracts, data model and migrations, public and admin APIs, lead capture, emails, admin
  screens for new content types, removal of the real-estate domain, seed data from the Figma copy.
- **Out of scope**: public page composition and routing (003), visual admin redesign, CRM integrations.
- **Depends on**: 001 data-model view models; client input for estimator pricing (Q1).
