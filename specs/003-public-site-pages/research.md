# Research: Public Site Pages

**Feature**: `003-public-site-pages` | **Date**: 2026-11-18

## R1. Data fetching

- **Decision**: Server Components fetch through one typed client `apps/web/src/lib/api/client.ts`:
  `apiGet(path, { lang, tags, preview })` → `fetch(BASE_URL + path, { headers: { 'Accept-Language': lang,
  'X-Preview-Token'? }, next: { tags, revalidate: 3600 }, signal: AbortSignal.timeout(8000) })`, response parsed with
  the matching `*WebSchema` from `@repo/shared` (throws a typed error on contract drift; logged to monitoring).
  Tags: `chrome`, `page:<key>`, `services`, `service:<slug>`, `sectors`, `articles`, `article:<slug>`, `jobs`,
  `job:<slug>`, `legal:<key>`, `estimator`.
- **Rationale**: Contracts enforced at the seam; tag-based invalidation matches 002 revalidation webhook (002 R11).
- **Alternatives**: TanStack Query on the client (larger JS, worse SEO); untyped fetch (silent drift).

## R2. Mapping API → design-system view models

- **Decision**: Pure mappers in `apps/web/src/mappers/*.ts` (e.g. `toServiceSummary(dto, lang)`), unit-tested, that add
  what the API does not know: locale-prefixed `href`s, dictionary labels (CTA texts, contract-type names), `ImageRef`
  from `ImageField`. Mapping table: 002 `contracts/shared-schemas.md` "Mapping to design-system view models".
- **Rationale**: Keeps components content-agnostic (001 FR-050) and API locale-agnostic about routes.

## R3. Rendering & caching

- **Decision**: All pages are statically rendered on demand and cached (ISR): `generateStaticParams` for `lang` and for
  slugs of services/articles/jobs (published at build; others render on first request), `revalidate = 3600` fallback,
  on-demand invalidation by tag via `POST /api/revalidate` (secret header, body `{ tags: string[] }`). Listing filters
  (`category`, `page`, `department`) render dynamically from cache-tagged fetches.
- **Rationale**: Fast first byte, < 60 s freshness after publish (SC-004), resilience if the API is down (stale content
  served).

## R4. Forms with progressive enhancement

- **Decision**: Next Server Actions (`apps/web/src/actions/*.ts`) receive `FormData`, validate with the
  shared schema, call the 002 endpoint server-to-server (forwarding the visitor IP in `X-Forwarded-For` for throttling and
  consent records), and return `{ status, fieldErrors, message }` consumed with `useActionState`. Works without JS (plain
  POST + server render). Job application uploads go through the action (`serverActions.bodySizeLimit: '6mb'` in
  `next.config.ts`). Upload progress is a JS-only enhancement: when JS is present the form posts via
  `XMLHttpRequest` to a route handler that reuses the same action logic and reports `upload.onprogress`; without
  JS the native form POST is used. Honeypot + `startedAt` fields rendered by the form components; Turnstile widget rendered only when
  `spam-settings.turnstileEnabled`.
- **Rationale**: FR-005 no-JS requirement; hides API origin details; one validation source.

## R5. Language negotiation

- **Decision**: `apps/web/proxy.ts`: default `ar`; on root `/` use cookie `NEXT_LOCALE` → else `Accept-Language` match →
  else `ar`; `LanguageToggle` hrefs computed server-side per page with the same path and query; cookie set on switch
  (1 year). `<html lang dir>` set in `[lang]/layout.tsx`.

## R6. Preview & revalidation endpoints

- **Decision**: `GET /api/preview?token=…&path=…` verifies the JWT locally with the shared `PREVIEW_SECRET` (no API call), enables `draftMode()`, redirects to `path`; `GET /api/preview/exit`. Preview banner component (001
  style) rendered when draft mode is on; `robots: noindex` and no caching. `POST /api/revalidate` validates
  `WEB_REVALIDATE_SECRET`, calls `revalidateTag` for each tag.
- **Dependency**: Requires 002 R12 token issuance; `PREVIEW_SECRET` shared between api and web.

## R7. Error, not-found and empty states

- **Decision**: `app/[lang]/not-found.tsx`, `app/[lang]/error.tsx`, `app/global-error.tsx`, maintenance mode via env
  `MAINTENANCE_MODE=true` handled in `proxy.ts` (503 page). New design-system sections needed: `ErrorState`,
  `EmptyState`, `PreviewBanner`, `FormSuccess` — added to 001's library in this feature's batch 1 (UI-owned package)
  with stories/tests, reviewed by the client.

## R8. Removal of starter leftovers

- **Decision** (re-based 2026-11-23 on the tree of `integration/001-002`: `projects`, `[slug]` and `units` are already gone there; on `main` or an older base delete them too): Delete leftovers of `app/[lang]/projects`, `app/[lang]/[slug]` (projects/units), `_components/hero-slider.tsx`,
  `src/components/units/*`, `src/components/ui/CustomButton.tsx`, `CustomHeader.tsx`, `CustomFooter.tsx`, legacy
  `src/animations/*` preloader/page transition and the GSAP dependency (removal confirmed 2026-11-18), Inter/Cairo
  fonts, legacy tokens in `tailwind.css`, `src/lib/server-data.ts` functions for projects; `sitemap.ts` projects/units entries,
  and rewrite legacy `src/components/careers`, `src/components/contact`, `app/[lang]/careers/*`, `app/[lang]/contact` onto the 002 models; keep `reference/`; `news` routes become
  `articles` with `/news/*` → `/articles/*` permanent redirects in `next.config.ts`.

## R9. Analytics hook points

- **Decision**: `apps/web/src/lib/analytics.ts` exposes `track(event, props)` with a typed event union
  (`page_view`, `lead_submitted{source,service,lang}`, `quote_requested`, `estimate_completed`, `job_applied{department}`,
  `contact_click{channel}`, `article_shared{network}`); in 003 it forwards to the existing monitoring endpoint only; 004
  connects consented vendors. No personal data in events.

## R10. Page metadata function

- **Decision**: `apps/web/src/lib/seo/page-metadata.ts` → `buildMetadata({ lang, path, seo, fallback })` returning Next
  `Metadata` with title/description/canonical/alternates/openGraph; every page's `generateMetadata` uses it. 004 extends
  it (OG images, JSON-LD) without page rewrites (FR-011).
