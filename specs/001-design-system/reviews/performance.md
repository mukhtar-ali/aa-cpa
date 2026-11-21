# Performance (T109, T116)

Measured 2026-11-21 on the production build (`next build` then `next start`, `ENABLE_REFERENCE_PAGES=true`), Chrome headless in WSL2 on a
slow drive; numbers are indicative, not CI-grade.

## T116: client JavaScript

Gzip size of every JS file the browser loads (scrolled to the bottom, network idle):

| Page | Files | gzip total |
| --- | --- | --- |
| `/en/reference/home` and `/ar/reference/home` | 13 | 331.1 kB |
| `/en/about` (existing legacy page, baseline) | 13 | 294.5 kB |

The reference page loads one extra chunk (`1-hdn6io7a71a.js`, 42.0 kB gzip: Radix Dialog, Tabs, Accordion and Direction, the estimator,
the marquee, the mobile nav) and the baseline loads one chunk of its own (5.4 kB). Library client JS is therefore about **36.6 kB** net,
**1.6 kB over the 35 kB budget**. Status: **not met**.

Where to win it back (not done): lazy-load the estimator below the fold, load the mobile nav dialog only on small screens, check that the
three Radix packages are not duplicated. About 295 kB of the total is the legacy app, which feature 003 replaces.

## T109: Lighthouse mobile (default simulated throttling)

| Locale | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| en | 82 | 100 | 100 | 92 | 4.8 s | 120 ms | 0 |
| ar | 77 (an earlier run scored 27 under load, discarded) | 100 | 100 | 92 | 4.2 s | 360 ms | 0 |

SC-005 asks for LCP under 2.5 s, CLS under 0.1 and interactions under 200 ms. CLS is met. **LCP is not met** under Lighthouse's simulated
mid-range phone; the LCP element is the hero paragraph (text), and the observed breakdown is small (about 30 ms to first byte plus 190 to 200 ms
render delay), so the simulated figure is dominated by JavaScript and CSS cost on a throttled CPU. TBT is above 200 ms in Arabic.
SEO 92: the reference page has no meta description (it is `noindex` by design).

Next steps before closing T109: cut JS (above), preload the primary font, re-measure in a quiet environment (and in CI), then decide whether
SC-005 is judged on lab or field data.
