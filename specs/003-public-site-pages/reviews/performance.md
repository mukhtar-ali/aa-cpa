# Performance (T041)

Status: **not measured**. Lighthouse CI is configured (`lighthouserc.json`, the manual `e2e` job in `.github/workflows/ci.yml`) with the
budgets ≥ 0.9 for performance, accessibility, best practices and SEO, LCP ≤ 2.5 s and CLS ≤ 0.1 on 14 URLs. It needs the API, seeded
data and the web app running, which this environment (WSL on a slow `/mnt/e` drive, no seeded stack) cannot do.

## To do on a machine with the stack

1. Start the API (seeded) and `pnpm --filter @repo/web build && pnpm --filter @repo/web start`.
2. `pnpm dlx @lhci/cli autorun --config=lighthouserc.json`
3. Record the scores per template below and fix regressions.

| Template | Perf | A11y | BP | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Home | | | | | | |
| About | | | | | | |
| Services / Service | | | | | | |
| Sectors | | | | | | |
| Articles / Article | | | | | | |
| Careers / Job | | | | | | |
| Contact | | | | | | |
| Legal | | | | | | |

## Known risks to check first

- Pages render per request (research R3 amendment); API calls are tag-cached, but TTFB depends on the API being close.
- Plain `<img>` is used in a few places (About, Careers team, PageHero from the library) instead of `next/image`: check LCP images have `fetchpriority` and sizes.
- `LogoMarquee` animates continuously; it respects reduced motion and has a pause button.
