# Sign-offs required for feature 001 (T117)

Status as of 2026-11-21. Nothing below has been signed off yet: each row is a request to the client or designer, with where to look. Do not
mark a row "approved" without a name and date from the person who approved it.

| # | Item | What to review | Where | Status |
| --- | --- | --- | --- | --- |
| 1 | Contrast overrides (research R4) | Seven token colours were darkened or lightened from the Figma values to reach WCAG AA: the five from R4, plus `text/accent`, `neutral/500`, `neutral/300`, and the new `status/error-inverse` (#f28b82, dark-surface error text). Figma values are kept in `tokens/figma-variables.json` as `figmaValue` with the reason. | Storybook: Foundations / Colors (contrast table) | Pending |
| 2 | Mobile and tablet layouts, mobile navigation (FR-031) | Figma is desktop only. Mobile nav design and the 320 to 1024 px behaviour of every section are team-designed. | Storybook at 360 and 768 px; `reviews/mobile-nav.md` | Pending |
| 3 | Estimator result step and form error summary | Both were designed by the team (no Figma frame). | Storybook: Sections / Estimator, Forms / FormErrorSummary | Pending |
| 4 | Final imagery | Hero portrait (cut-out), photos and logos are placeholders until licensed images arrive. | `apps/web/public/reference/README.md` | Pending |

## Additional decisions found during delivery (not in plan.md, need an answer)

- Section radius is 30 px in Figma; the task text said 32 px. Shipped 30 px.
- Button variant `paper` (beige fill, green label) replaces the contract's `outline-light`; medium button height is 48 px, not 44 px.
- `layout/content-width-wide` is assumed to be 1320 px.
- Header height and active-link style are not verified against a Figma frame.
- Layouts inferred because the Figma frame was not readable: FeaturedNews, TimelineStepper, ContactItem, OfficeMap (pins and map image), contact form (`524:3651`), application form (`514:3194`), dark CtaCard.
- Sector row typography in SectorIndex is inferred.
- Legal pages render `section.html` as-is: the API must store sanitised HTML.
