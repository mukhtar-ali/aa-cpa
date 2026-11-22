# AA-CPA Roadmap (Spec Kit features)

Constitution: `.specify/memory/constitution.md` · Figma: file `1jzfujyx2OJ6EKDRD2X6Xm`, page "Page 1" only.

| # | Feature | Implementer | Depends on | Status |
| --- | --- | --- | --- | --- |
| 001 | [Design system](./001-design-system/spec.md) — tokens, ~70 bilingual components, Storybook, reference homepage | agy (worktree `aa-cpa-001`) | — | Planned; batch 1 (T001–T032) in progress |
| 002 | [CPA content & lead backend](./002-cpa-content-backend/spec.md) — contracts, remove real-estate, content API, forms, estimator, admin | agy (own worktree) | — (contracts PR first) | Planned (spec, plan, 84 tasks) |
| 003 | [Public site pages](./003-public-site-pages/spec.md) — 12 pages AR/EN wired to the API, forms, preview, revalidation | agy | 001 merged, 002 US1+US2 merged | Planned (spec, plan, tasks) |
| 004 | [SEO, compliance & launch](./004-seo-compliance-launch/spec.md) — SEO, consent analytics, PDPL, security, infra, content, UAT, go-live | agy + client inputs | 001–003 on staging | Planned (spec, plan, tasks) |

## Order and parallelism

```text
001 design system ──────────────┐
002 contracts PR ──► 002 rest ──┼──► 003 public pages ──► 004 launch
                                 │
            (001 types align with 002 contracts)
```

- 001 and 002 run in parallel (separate worktrees and agy sessions).
- 003 starts when 001 is merged and 002's contracts and public API are merged.
- 004's non-code tracks (content entry, legal texts, DNS/email, analytics account) start now with the client.
- 004 Batch A (staging/production infrastructure, T006–T011a) is a prerequisite for putting 003 on staging; run it
  as soon as 002's API builds.

## Client inputs needed (owner: project manager)

| Needed for | Input |
| --- | --- |
| 001 | Acknowledge contrast adjustments; review mobile navigation; review estimator result/quote step |
| 002 | Approve estimator questions and fee bands (draft seeded) |
| 003 | English copy approval; designed 404/500/empty states review |
| 004 | Domain/DNS access, hosting budget, legal-approved privacy policy and terms, analytics account, licensed photos, client-logo permissions, staff list and roles |

## Review gates (Claude)

Each batch ends at a quickstart checkpoint (001: V1–V7, 002: B1–B8, 003/004: defined in their plans). Claude reviews
the batch report, re-runs the checks and reports go/no-go before the next batch is delegated.
