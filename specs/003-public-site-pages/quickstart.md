# Quickstart & Validation: Public Site Pages

## Setup

```bash
pnpm install
pnpm --filter @repo/api db:migrate && pnpm --filter @repo/api seed -- --content
pnpm dev                      # web :3000, api :3001, admin :3002
pnpm --filter @repo/web test  # mappers, actions, api client
pnpm test:e2e --project=web   # journeys
pnpm lhci                     # Lighthouse CI against a production build
```

## Gates

- **P1 Routing & language** — 12 pages × 2 languages render from seeded data; `/` → `/ar` (or `/en` for an English
  browser); switcher keeps path/query and is remembered; `/news/x` → `/articles/x` (308); unknown slug → branded 404.
- **P2 Parity** — each page at 1512 compared with its Figma frame (page map in spec); 360/768/1024 reviewed; client
  sign-off recorded in `specs/003-public-site-pages/reviews/parity.md`.
- **P3 Forms** — contact (incl. `?service=` preselect), quote, job application: valid/invalid/no-JS/double-submit/closed
  job; leads visible in admin; anti-spam fields present.
- **P4 Freshness & preview** — publish in admin → page updated < 60 s; preview link shows draft with banner and
  `noindex`; expired token → 404/redirect.
- **P5 Quality** — axe 0 serious/critical on all pages; keyboard completes every form; Lighthouse mobile ≥ 90 ×4 per
  template; no hard-coded copy (grep for Arabic/English literals in `app/` outside dictionaries returns nothing).
- **P6 Cleanup** — no imports of removed shared types; `gsap`, starter components and fonts removed; build and type-check green.
