# Style audit (T042b, 001 SC-007)

Question: how much of the styling in `apps/web/app/**` is written in the web app instead of coming from the design-system library?
Target: under 5 % of utility classes are non-layout.

## Method

Count every class in a `className` of `apps/web/app/**/*.tsx` (excluding `reference/`). A class is "layout" when it only arranges things
(flex, grid, gap, padding and margin, width and height, position, overflow, responsive prefixes). Anything else (colour, typography,
border, radius, background) is "non-layout". The script is the one-liner at the end of this file.

## Result (2026-11-23, after T017–T040)

| Measure | Value |
| --- | --- |
| Classes counted | 218 |
| Non-layout | 30 (13.8 %) |
| Of which not real styling | 5 (`ds-prose` is a library class, 2 font CSS-variable names) → about 11 % |

**Target not met.** Page bands use `Section`, headings use `Heading`, body text uses `Text`, and cards reuse `PerkTile`. What remains is
four repeated shapes the library does not have yet:

1. A framed figure with a dark caption (About, signatory photo): `rounded-cta bg-bg-inverse text-text-inverse`.
2. A facts list (`dl`) on the job page: `rounded-card bg-bg-surface-ice`, small muted labels.
3. The "this page is only in Arabic" notice on English article pages: `rounded-cta bg-bg-surface-ice text-body-sm`.
4. Numbered list rows (About commitments): `border-b border-solid border-border-subtle`, large accent numeral.

**Recommendation**: add `FigureCard`, `FactList`, `Notice` and `NumberedList` to the library (feature 001 follow-up), then replace these
four. That removes about 20 of the 30 classes and reaches roughly 4 %. Not done here because it changes the library, which 003 does not own.

## Script

```sh
cd apps/web && node -e '<the script kept in the repo history: scans app/**/*.tsx className strings and counts classes outside the layout pattern>'
```
