# Feature Specification: SEO, Analytics, Compliance & Production Launch

**Feature Branch**: `004-seo-compliance-launch`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Everything needed to take the finished site live for the client: search visibility in
Arabic and English, consented analytics, PDPL compliance, security and performance hardening, production
infrastructure with backups and monitoring, content entry, user acceptance and go-live."

## Context

After 001–003 the site works on staging. This feature makes it production-grade and launches it on the client's domain
(`aacpa.sa`, from Figma footer `info@aacpa.sa`). The repository already contains Docker images, a VPS deploy guide
(`docs/DEPLOY_VPS.md`, Coolify or plain Docker + GitHub Actions), monitoring (web vitals, errors, events) and per-page SEO
storage; this feature completes and verifies them for this site.

## Clarifications

### Session 2026-11-18

- Launch locales: Arabic (default) and English.
- Approved pages: Figma "Page 1" only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The firm is found in search in both languages (Priority: P1)

A business owner searching in Arabic or English for audit, zakat or local-content services in Riyadh, Al-Khobar or
Al-Qassim finds the firm's pages with correct titles, descriptions, language versions, office details and rich results.

**Why this priority**: Organic search is the main lead channel (constitution VII).

**Independent Test**: Validate every page template with search-engine testing tools (rich results, mobile-friendly,
hreflang), and check the sitemap and robots rules on staging and production.

**Acceptance Scenarios**:

1. **Given** any public page, **Then** it has a unique localized title and description, a canonical URL, alternate
   language links for Arabic, English and a default, and a social sharing image.
2. **Given** the home and contact pages, **Then** they publish the organisation's structured data (name, licence,
   logo, offices with addresses and phone, opening hours, social profiles).
3. **Given** an article, job, FAQ block or breadcrumb trail, **Then** the matching structured data validates without
   errors.
4. **Given** staging or preview URLs, **Then** they are never indexable.

---

### User Story 2 - Visitors control tracking (Priority: P1)

A visitor sees a bilingual consent banner on first visit, can accept, reject, or choose categories, and can change their
choice later from the footer; no non-essential tracking runs before consent.

**Why this priority**: PDPL compliance and client trust (constitution VIII).

**Independent Test**: Inspect network requests before and after each consent choice; verify the choice is stored and
honoured on every page.

**Acceptance Scenarios**:

1. **Given** no choice yet, **Then** only strictly necessary cookies are set and no analytics or advertising requests are
   sent.
2. **Given** a visitor accepts analytics only, **Then** analytics loads and advertising pixels do not.
3. **Given** a visitor changes their choice from the footer link, **Then** the new choice applies immediately.

---

### User Story 3 - The firm measures leads (Priority: P2)

Firm management sees how many visitors become leads, from which pages, channels and campaigns, and which services and
sectors attract interest.

**Independent Test**: Perform test journeys and confirm each event appears once with correct properties in the
analytics property and in the admin dashboard.

**Acceptance Scenarios**:

1. **Given** a contact submission, quote request or job application, **Then** one conversion event is recorded with the
   page, service and language (no personal data).
2. **Given** a click on phone, email or WhatsApp links, **Then** an engagement event is recorded.

---

### User Story 4 - The site is secure, fast and recoverable in production (Priority: P1)

The site runs on the client's domain over HTTPS with security headers, monitored uptime and errors, daily backups that
have been restored at least once, and a documented rollback.

**Why this priority**: A production client system must be reliable and recoverable.

**Independent Test**: Run security header and TLS scans, a load test, an uptime alert drill, and a backup restore drill
on staging; record results.

**Acceptance Scenarios**:

1. **Given** production, **Then** TLS rating is A or better and security headers (CSP, HSTS, frame, referrer,
   permissions policies) are present without breaking the site.
2. **Given** the API or web container stops, **Then** the on-call contact is alerted within 5 minutes.
3. **Given** a backup from the previous day, **When** restored to a fresh environment, **Then** the site and admin work
   with all content, leads and uploaded files.
4. **Given** a bad release, **When** rolled back, **Then** the previous version is live within 15 minutes.

---

### User Story 5 - Content is complete and approved (Priority: P1)

All launch content (Arabic and English copy, licensed photos, client logos, credentials, team portraits, legal texts,
estimator prices) is entered by or for the client in the admin portal and approved.

**Why this priority**: The site cannot launch with placeholders or watermarked images.

**Independent Test**: A content audit report lists every page block with status (entered, translated, approved) and
finds no placeholder text, no missing alt text, and no watermarked or unlicensed images.

**Acceptance Scenarios**:

1. **Given** the content audit, **Then** 100% of blocks are approved in both languages, or explicitly marked
   Arabic-only by the client.
2. **Given** the estimator, **Then** its pricing is approved by the client and the draft flag is cleared.

---

### User Story 6 - The client team can run the site (Priority: P2)

Client staff can sign in, edit content, publish, manage leads and applications, and handle a data-subject request on
their own, using a short bilingual guide and a recorded training session.

**Independent Test**: A client staff member completes a scripted set of tasks unaided in under 30 minutes.

**Acceptance Scenarios**:

1. **Given** the admin guide, **When** a staff member follows it, **Then** they can publish an article, update a service,
   reply to a lead (status change + note), and export a person's data.
2. **Given** staff accounts, **Then** each person has only the permissions of their role (editor, HR, partner, admin).

---

### User Story 7 - Go-live and hypercare (Priority: P1)

The site switches to the production domain with no broken links, email delivery verified, and two weeks of hypercare
with daily checks.

**Independent Test**: Execute the go-live checklist; all items pass; post-launch monitoring shows no critical errors for
14 days.

**Acceptance Scenarios**:

1. **Given** DNS cutover, **Then** `aacpa.sa` and `www.aacpa.sa` serve the site over HTTPS with one canonical host and the
   other redirecting.
2. **Given** email sending from the domain, **Then** SPF, DKIM and DMARC are configured and test messages land in the
   inbox (not spam) for Gmail and Outlook.
3. **Given** the client's previous website (if any), **Then** its important URLs redirect to the new equivalents.

### Edge Cases

- The client has an existing website with search rankings: URL inventory and redirects are required before cutover.
- Shared hosting email on the same domain: mail records must not break the client's existing mailboxes.
- Consent stored but analytics vendor changes: consent version bump re-prompts visitors.
- Right-to-left text in social sharing images and structured data.
- Peak traffic after a marketing campaign: the site must stay responsive at 10× normal load.

## Requirements *(mandatory)*

### Functional Requirements

**SEO**

- **FR-001**: Every public page MUST have localized title, description, canonical, alternate language links (`ar`, `en`,
  `x-default` → Arabic), Open Graph and social card data, editable per page (and per item for services, sectors,
  articles, jobs) in the admin portal with sensible automatic defaults.
- **FR-002**: Structured data MUST be published for the organisation (accounting service with offices, licence, logo,
  socials), breadcrumbs, articles, job postings, FAQ blocks and services.
- **FR-003**: The sitemap MUST list every published page in both languages with alternates and last-modified dates; the
  robots rules MUST block staging, previews, admin and API documentation.
- **FR-004**: Automatically generated social sharing images MUST be available for pages without a chosen image, rendering
  Arabic text correctly.
- **FR-005**: The content team MUST be able to manage redirects (old URL → new URL, permanent/temporary) in the admin
  portal; legacy URLs from any previous client site are imported before launch.

**Analytics & consent**

- **FR-010**: A bilingual consent banner and preferences dialog MUST gate non-essential cookies by category (necessary,
  analytics, marketing), record consent version and date, and be reachable from the footer at any time.
- **FR-011**: Analytics MUST record page views and the events defined in 003 (conversions and engagement) without
  personal data, only after consent; the existing tag-manager/pixel settings MUST respect consent.
- **FR-012**: The admin dashboard MUST show leads by source, service and page, and estimator completions, for selectable
  periods.

**Compliance**

- **FR-020**: Privacy policy and terms MUST be finalised by the client's legal advisor, versioned, and linked from every
  form; consent records MUST reference the policy version (002).
- **FR-021**: A record of processing (what personal data, purpose, retention, who can access) MUST be produced for the
  client.
- **FR-022**: Accessibility conformance MUST be audited on the final content (automated + manual screen-reader pass in
  Arabic and English) and an accessibility statement page content provided to the client.

**Security & performance**

- **FR-030**: Production MUST enforce HTTPS, HSTS, a content security policy compatible with analytics and maps,
  restricted CORS, secure cookies, and rate limits; secrets live only in the server environment.
- **FR-031**: A dependency and container vulnerability scan MUST run in CI and show no high or critical issues at launch.
- **FR-032**: A penetration-style review of public forms, uploads, auth and admin MUST be performed and findings fixed or
  accepted by the client.
- **FR-033**: Load test: home, service, article and contact pages sustain 10× expected peak (assume 50 concurrent visitors
  → 500) with p95 page response under 1 s from cache.
- **FR-034**: Static assets and images MUST be served with long-lived caching and modern formats; a CDN in front of the
  site is recommended and configured if the client approves the cost.

**Infrastructure & operations**

- **FR-040**: Production and staging environments MUST exist with the same configuration, deployed from the main branch
  through CI with health checks and one-step rollback (existing `docs/DEPLOY_VPS.md` path, Coolify or Docker + Actions).
- **FR-041**: Daily database and uploaded-file backups MUST be kept off-server for at least 30 days, encrypted, and a
  restore MUST be rehearsed before launch.
- **FR-042**: Uptime, error-rate, disk, certificate-expiry and failed-email alerts MUST notify named contacts.
- **FR-043**: Background email delivery MUST be monitored; if Redis/BullMQ is adopted (docs/redis-bullmq-plan.md) it is
  part of this feature, otherwise the 002 outbox stays.
- **FR-044**: Email from the domain MUST have SPF, DKIM and DMARC; transactional sender and reply-to addresses agreed
  with the client.

**Content, training, acceptance, launch**

- **FR-050**: A content audit checklist MUST cover every block of every page in both languages; photo licences and
  client-logo permissions MUST be recorded.
- **FR-051**: A bilingual admin guide (short, task-based) and one recorded training session MUST be delivered.
- **FR-052**: User acceptance testing MUST be run with the client against the 003 journeys and signed off.
- **FR-053**: A go-live checklist and runbook (DNS, certificates, email, search console verification and sitemap
  submission, analytics checks, smoke tests, rollback) MUST be executed and recorded; hypercare lasts 14 days.

### Key Entities

- **Redirect rule**: source path, target path, type (permanent/temporary), hit count, created by.
- **Consent preference** (browser-side record): categories, version, timestamp.
- **SEO record**: existing per-page and per-item SEO fields, plus social image.
- **Launch artefacts**: content audit, record of processing, accessibility statement, runbook, test reports.

## Success Criteria *(mandatory)*

- **SC-001**: 100% of public pages pass structured-data and hreflang validation with zero errors at launch.
- **SC-002**: Search console shows all sitemap URLs discovered and ≥ 90% indexed within 30 days of launch.
- **SC-003**: No non-essential cookie or tracking request occurs before consent (verified on all page templates).
- **SC-004**: Lighthouse mobile ≥ 90 in all categories on production for every template; field Core Web Vitals "good"
  after 28 days.
- **SC-005**: Uptime ≥ 99.9% in the first 30 days; backup restore rehearsal completed in under 1 hour.
- **SC-006**: Zero high or critical security findings open at launch.
- **SC-007**: Client staff complete the scripted admin tasks unaided in under 30 minutes; UAT signed off.
- **SC-008**: First month: every lead submitted on the site appears in the admin portal and the staff inbox (0 lost).

## Assumptions

- Domain `aacpa.sa` is owned by the client, who grants DNS access or performs the changes with us.
- Hosting is a VPS (per existing docs) unless the client chooses otherwise; costs (VPS, backups storage, CDN, email
  service) are approved by the client.
- Analytics vendor: Google Analytics 4 via the existing tag-manager settings, unless the client prefers a
  privacy-friendly alternative; consent mode respected either way.
- The client's legal advisor supplies or approves the final privacy policy and terms; we provide drafts based on the
  approved Figma copy.
- If there is no previous website, the legacy-redirect work is skipped.

## Dependencies & Scope

- **In scope**: SEO completion, consent and analytics, compliance documents support, security/performance hardening,
  environments, backups, monitoring, email domain setup, content audit and entry support, training, UAT, go-live,
  hypercare.
- **Out of scope**: paid advertising campaigns, ongoing content writing, CRM integration (possible later feature).
- **Depends on**: 001, 002, 003 merged and deployed to staging; client inputs listed in Assumptions.
