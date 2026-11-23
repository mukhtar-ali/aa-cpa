# Review backlog (targeted reviews of 2026-11-22)

Four read-only reviews covered forms and validators, HTML and link rendering, the web app and scripts, and the stateful components. This file
tracks every finding to a status. "Fixed" means a code change plus a test; the commit that holds it is in git history under the message
"targeted review findings" and the "review backlog" commits that follow.

| # | Finding | Severity | Status |
| --- | --- | --- | --- |
| 1 | Dockerfile did not copy `packages/design-system` | High | Fixed (`1a766b3`) |
| 2 | Reference route could be baked in at build time | Medium | Fixed (`force-dynamic`) |
| 3 | Estimator quote form: weak validation, no per-field errors | Medium | Fixed |
| 4 | FormErrorSummary not refocused on a second failed submit | Medium | Fixed (`focusKey`) |
| 5 | CV upload: hidden input id, error link, clear on change | Medium | Fixed |
| 6 | CV accept list by MIME only (empty type on Windows) | Medium | Fixed (extensions added) |
| 7 | Success message not announced | Medium | Fixed (focus moves to it) |
| 8 | Focus lost after choosing a file | Low | Fixed |
| 9 | Honeypot name `website` | Low | Kept: the API guard reads `body.website` |
| 10 | Forms sent `elapsedMs`; API reads `startedAt` | Medium | Fixed (found while checking 9) |
| 11 | Estimator Back left a stale error | Low | Fixed |
| 12 | Estimator accepted "-5" and "1.5" as 5 and 15 | Low | Fixed (rejected) |
| 13 | Duplicate ids with two estimators | Low | Fixed (`useId`) |
| 14 | Focus stolen on mount in StrictMode | Low | Fixed |
| 15 | `javascript:` / `data:` hrefs from data | Medium | Fixed (`safeHref`) |
| 16 | mailto / tel / wa.me built from free text | Low | Fixed (`contactHref`) |
| 17 | IconButton dropped `onClick` in link mode; disabled link had no role | Medium | Fixed |
| 18 | Pagination ellipsis hid a single page; page not clamped | Low | Fixed |
| 19 | RelatedCarousel end state, counter, resize, empty list | Medium | Fixed |
| 20 | TableOfContents stale active section, reduced motion, hash | Medium | Fixed |
| 21 | Footer nav `aria-labelledby` with spaces in ids | Medium | Fixed |
| 22 | Marquee pause button could not resume | Medium | Fixed |
| 23 | `useReducedMotion` hydration mismatch | Medium | Fixed |
| 24 | Hijri years from the SA locale | Low | Fixed (Gregorian) |
| 25 | ShareBox shared the box heading, copy flag never reset | Medium | Fixed (`shareText`) |
| 26 | ServiceTabs panel had no focus ring; bad default id | Low | Fixed |
| 27 | OfficeMap key collisions, dead links | Low | Fixed |
| 28 | JobRow `h3` in `span`, empty separators | Low | Fixed |
| 29 | Identical link names on repeated cards | Low | Fixed |
| 30 | build-icons could delete cwd/parents | Low | Fixed |
| 31 | ChromeSwitch regex too broad | Low | Fixed |
| 32 | Mock estimator NaN | Low | Fixed |
| 33 | Card headings fixed at level 3 | Low | Fixed (`headingLevel`) |
| 34 | Stretched-link cards without a focus ring | Low | Fixed |
| 35 | Duplicate React keys (marquee, credentials, stats, tags, CTA) | Low | Fixed |
| 36 | `formatNumber`/`formatCurrency` printed NaN or threw on a bad currency | Low | Fixed |
| 37 | Avatar read the visible name twice | Low | Fixed (`labelled`) |
| 38 | StatsStrip values not bidi-isolated | Low | Fixed |
| 39 | Forms and Estimator could hang forever on a request that never settles | Low | Fixed (`submitTimeoutMs`, `timeoutMs`, `withTimeout`) |
| 40 | Flow-lines ignored the light tone | Low | Fixed (pale grey line on light tones) |
| 41 | `DesignSystemProvider` direction could disagree with `<html dir>` | Low | Fixed (development warning) |
| 42 | Field dropped its help text (and a dangling `aria-describedby`) when an error showed | Low | Fixed |
| 43 | Field alerts and the error summary both announced | Low | Fixed (`announce={false}` in the two form layouts) |
| 44 | Honeypot field could be autofilled by password managers | Low | Mitigated (ignore hints); name kept for the API |
| 45 | Estimator: Enter did nothing; amounts not bidi-isolated; empty questions gave NaN | Low | Fixed |
| 46 | SlideCounter with total 0 produced an invalid progressbar | Low | Fixed (renders nothing) |
| 47 | Disabled `asChild` Button still ran the child handler and kept `href` | Low | Fixed |
| 48 | ShareBox: link field named "Copy link", section unnamed, copy failure silent | Low | Fixed |
| 49 | BackToTop left keyboard focus at the footer | Low | Fixed (focus moves to `main`) |
| 50 | Language link in the mobile sheet did not close it | Low | Fixed |
| 51 | Breadcrumbs silently dropped without a label | Low | Fixed (development warning) |
| 52 | LegalDocument took unsanitised strings and used content ids as element ids | Medium | Fixed (`SanitizedHtml` brand + `markSanitizedHtml`, `legal-` id prefix) |
| 53 | build-tokens wrote unescaped values into CSS and TypeScript | Low | Fixed (names and values validated) |
| 54 | Analytics scripts loaded on environments serving the reference pages | Low | Fixed (off when `ENABLE_REFERENCE_PAGES=true`) |
| 55 | `proxy.ts` default locale changed from `en` to `ar` | Info | Intentional (Arabic first); call out in the PR |
| 56 | Legacy layout still fetches SEO, site info and header projects on reference pages | Info | Accepted: feature 003 removes the legacy chrome |

