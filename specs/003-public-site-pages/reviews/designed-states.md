# Designed states: client sign-off (T044)

Each state below is built from the design-system sections (`ErrorState`, `EmptyState`, `FormSuccess`, `PreviewBanner`) and the label
dictionaries. They are **not in the approved Figma pages**, so the client needs to confirm the look and the wording (constitution I).
Status: **waiting for sign-off** (nothing has been shown to the client yet).

| State | Where | Wording source | Signed off |
| --- | --- | --- | --- |
| 404 page | `app/[lang]/not-found.tsx` | `labels.states` | |
| Error (500) page | `app/[lang]/error.tsx`, `app/global-error.tsx` | `labels.states` | |
| Maintenance (503) page | `proxy.ts` (`MAINTENANCE_MODE=true`) | `labels.states` | |
| Empty list (no articles, no jobs) | Articles, Careers | `labels.states`, `labels.careers` | |
| Form success | Contact, Careers, Estimator quote | CMS (`form.successTitle/Body`), `labels.careers.success`, `labels.estimator.success` | |
| Closed job | `careers/[slug]` | `labels.careers.closedTitle/Body` | |
| Preview banner | every page in draft mode | `labels.preview` | |
| Accessibility statement | `/accessibility` | CMS (feature 004 writes the content) | |
| Estimator not approved (contact call to action) | Home, About, Services, Sectors, Articles, Service | `labels.estimator.fallback*` | |
| Arabic-only notice on English articles | `articles/[slug]` | `labels.common.translationFallback` | |

## How to review

Run the app with the API, open each state (`?` in the table gives the file), screenshot at 1512 and 360 px in both languages, and send to the
client with the table. Record the answer and date in the last column.
