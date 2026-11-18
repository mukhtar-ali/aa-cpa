<!--
Sync Impact Report
- Version change: (template, unversioned) → 1.0.0
- Principles defined (all new):
  I. Figma Is the Source of Truth
  II. Design-System First
  III. Arabic-First, Bilingual, Direction-Agnostic
  IV. Accessibility — WCAG 2.2 AA (NON-NEGOTIABLE)
  V. Contract-First Full Stack
  VI. Test Discipline
  VII. Performance & SEO
  VIII. Security & Privacy
- Added sections: Technology Constraints, Development Workflow & Quality Gates, Governance
- Removed sections: none (template placeholders replaced)
- Templates:
  ✅ .specify/templates/plan-template.md — Constitution Check is derived from this file; no edit needed
  ✅ .specify/templates/spec-template.md — no mandatory-section changes required
  ✅ .specify/templates/tasks-template.md — "tests are optional" note amended: tests are REQUIRED (Principle VI)
  ✅ CLAUDE.md — managed Spec Kit block points to the active plan; no principle references to update
- Deferred TODOs: none
-->

# AA-CPA Website Constitution

Production website and CMS for **Abdulrahman Al-Shubaishiri Professional Consulting**
(شركة عبدالرحمن الشبيشيري للاستشارات المهنية), a SOCPA-licensed (No. 522) audit and advisory firm
in Saudi Arabia and member of the 3E Accounting network. Built on the existing Turborepo monorepo:
`apps/web` (Next.js 16, Tailwind CSS v4), `apps/api` (NestJS 11, Prisma, MySQL), `apps/admin`
(Vite, React 19, shadcn/ui), and `packages/shared` (Zod schemas, models, endpoints).

## Core Principles

### I. Figma Is the Source of Truth

- The approved design is Figma file `1jzfujyx2OJ6EKDRD2X6Xm` (AA-CPA), **page "Page 1" only**.
  The approved homepage is **"Homepage – with logo lines" (node `411:169`)**. Frame `1:2`
  ("Homepage") is NOT approved.
- Frames on any other page ("Website Design", "Components" library versions v14–v19,
  "Homepage — Inspo Creative", "Options 01–19", etc.) MUST NOT be implemented unless they are
  moved to "Page 1" or the client approves them in writing.
- Every design-system component and every page MUST cite the Figma node id(s) it implements
  (code comment and story/spec metadata).
- Visual parity MUST be verified against Figma at 1512px desktop and at mobile width before a
  page is marked done. Where Figma is silent (mobile, hover/focus, empty/error states), the
  implementation MUST extend the established visual language and record the decision in the spec.

**Rationale**: The Figma file has many superseded explorations; one explicit approved surface
prevents drift and rework for a client sign-off.

### II. Design-System First

- Design tokens (color, typography, spacing, radius, shadow, motion) MUST mirror the Figma
  variables 1:1 by semantic name (e.g. `bg/page`, `text/heading`, `action/primary`,
  `Heading/H1`, `space-24`).
- Feature and page code MUST NOT contain raw hex colors, raw font sizes or ad-hoc spacing values;
  they MUST use tokens or design-system components.
- Pages compose design-system components and sections. A new visual pattern MUST first be added
  to the design system (with a story and tests), then consumed.
- Components are typed, documented, composable and free of data fetching; data enters through props.

**Rationale**: A reusable, token-driven system is the only way to keep 12+ bilingual pages
consistent and cheap to change after client feedback.

### III. Arabic-First, Bilingual, Direction-Agnostic

- Arabic (`ar`, RTL) is the default locale; English (`en`, LTR) ships at launch with full parity.
- Layout MUST use logical properties and utilities only (`ms-*`, `pe-*`, `start-*`, `text-start`,
  `inset-inline-*`). Physical `left`/`right`, `ml`/`mr`, `pl`/`pr` are forbidden except for
  documented, intentionally non-mirrored visuals (e.g. a logo mark).
- Directional icons (arrows, chevrons, sliders) MUST mirror by direction.
- User-visible strings MUST come from locale dictionaries (UI chrome) or the CMS (content).
  Hard-coded copy in components is forbidden.
- Numbers, dates and currency MUST be formatted with locale-aware `Intl` APIs.

**Rationale**: The client's audience is Saudi; English serves international partners. One
direction-agnostic codebase avoids a second implementation.

### IV. Accessibility — WCAG 2.2 AA (NON-NEGOTIABLE)

- Semantic HTML landmarks and heading order; one `h1` per page.
- Every interactive element is keyboard operable with a visible focus indicator that meets
  contrast requirements.
- Text and UI contrast MUST meet AA against the token pairs actually used; token pairs that fail
  are documented and not used for text.
- Motion (GSAP animations, logo marquees, carousels) MUST respect `prefers-reduced-motion`, and
  auto-moving content MUST be pausable.
- Forms: programmatic labels, required markers, inline errors linked via `aria-describedby`
  and announced; no information conveyed by color alone.
- Automated axe checks MUST pass with zero serious/critical violations for every component and page.

**Rationale**: Accessibility is a legal and reputational baseline for a professional-services firm.

### V. Contract-First Full Stack

- API request/response contracts MUST be defined as Zod schemas in `@repo/shared` and consumed by
  `apps/api`, `apps/admin` and `apps/web`; no duplicated hand-written types.
- Every public content block (hero copy, services, sectors, stats, testimonials, client logos,
  offices, FAQs, news, jobs, legal pages, SEO) MUST be editable by an authorized admin user,
  bilingually. Frontend constants are allowed only for UI chrome labels.
- Public pages MUST degrade gracefully when CMS data is missing (no crash, no empty broken sections).
- Admin features MUST be gated by `PermissionEnum` RBAC.

**Rationale**: The client must run the site without developers; a shared contract stops the
three apps drifting apart.

### VI. Test Discipline

- Design-system components: unit tests (render, variants, RTL and LTR, keyboard behavior) plus
  axe checks, and a story per variant/state.
- API: unit tests for services; e2e tests for every new or changed endpoint (validation, auth,
  RBAC).
- Playwright MUST cover critical journeys: locale switch, contact form, job application with CV
  upload, fee estimator, news browsing, and admin editing of a content block reflected on the web.
- Tests are REQUIRED, not optional. A task is not done until its tests pass in CI.

**Rationale**: This is a production client system; regressions in forms or content are business-visible.

### VII. Performance & SEO

- Core Web Vitals on mobile (p75): LCP < 2.5s, CLS < 0.1, INP < 200ms. Lighthouse Performance,
  Accessibility, Best Practices and SEO ≥ 90 on every page template.
- React Server Components by default; `"use client"` only for interactive leaves.
- Images via `next/image` with explicit dimensions; fonts (Almarai) self-hosted via `next/font`
  with `display: swap` and subsetting.
- Every page has localized metadata, canonical and `hreflang` (`ar`, `en`, `x-default`), Open
  Graph images, sitemap entries, and structured data where applicable (Organization /
  AccountingService with offices, Article, JobPosting, FAQPage, BreadcrumbList).

**Rationale**: Organic search and first impressions are the firm's primary lead channels.

### VIII. Security & Privacy

- Existing hardening (refresh-token rotation, CSRF, throttling, lockout, CORS allow-list,
  HTML sanitization) MUST be preserved; no regressions.
- Public forms (contact, job application, estimator lead capture) MUST record explicit consent
  aligned with the Saudi Personal Data Protection Law (PDPL) and link to the privacy policy.
- Uploads MUST be validated by type and size server-side and stored privately where they
  contain personal data (CVs).
- Public endpoints MUST be rate-limited and protected against spam (honeypot, with an optional
  CAPTCHA behind a setting).
- No secrets, credentials or real personal data in the repository.

**Rationale**: The site collects client and candidate personal data on behalf of a regulated firm.

## Technology Constraints

- Keep the existing stack and tooling: pnpm 9, Turborepo, Node 22, TypeScript strict, ESLint 9
  flat config, Prettier, Next.js 16 App Router, Tailwind CSS v4, NestJS 11, Prisma 6 + MySQL 8,
  Vite admin with shadcn/ui, TanStack Router/Query, Playwright.
- Remove the real-estate domain (Projects, Units, Inquiries) from api, admin, web, shared and
  e2e. Keep and adapt: auth, users, RBAC, CMS sections, News (Articles), Careers, Contact, SEO,
  uploads, email, monitoring, dashboard.
- New dependencies require a stated reason in the plan (what it replaces or why the platform
  cannot do it). Prefer platform features and existing dependencies.
- The public design system lives in its own workspace package and MUST NOT import from any app.

## Development Workflow & Quality Gates

- Every feature follows Spec Kit: `specify` → `clarify` → `plan` → `tasks` → `analyze` →
  `implement`, in `specs/NNN-feature-name/` on a branch of the same name.
- Commits follow Conventional Commits. Work merges through a reviewed pull request.
- CI gates (all MUST pass): lint, type-check, unit tests, API e2e tests, build, and Playwright
  smoke on the full stack. Visual parity and axe results are attached to UI pull requests.
- The "Constitution Check" in each plan MUST list every principle as pass or justified violation;
  unjustified violations block the plan.
- Ambiguities in Figma or requirements are recorded as `[NEEDS CLARIFICATION]` in the spec and
  resolved with the client before implementation of the affected story.

## Governance

- This constitution supersedes `README.md`, `docs/*` and ad-hoc conventions where they conflict.
- Amendments are made by pull request that updates this file, includes a Sync Impact Report, and
  bumps the version: MAJOR for removed or redefined principles, MINOR for added principles or
  materially expanded guidance, PATCH for clarifications.
- Reviewers MUST verify constitution compliance on every pull request; complexity or exceptions
  MUST be justified in the plan's Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-11-18 | **Last Amended**: 2026-11-18
