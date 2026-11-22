# Homepage parity: reference page vs Figma 411:169 (task T108, in progress)

Tool: `node e2e/visual/figma-diff.mjs` (Figma 1x export `e2e/visual/figma/home-1512.png` vs `/ar/reference/home` at 1512 px, Chrome).
Run with `ENABLE_REFERENCE_PAGES=true` on the web app, for example `PW_CHANNEL=chrome node e2e/visual/figma-diff.mjs --url http://localhost:3100/ar/reference/home`.

## Status (2026-11-20)

| Pass | Differing pixels | Page height vs Figma | What changed |
| --- | --- | --- | --- |
| 1 | 69.4 % | 709 px shorter | first composition |
| 2 | 50.5 % | 210 px taller | hero gradient title, utility bar order, logo marquee added, ice services band with rounded top, gap statement gradient, reasons action beside the heading, hero/gap overlap |

The percentage is dominated by photos (placeholders), exact text anti-aliasing and small offset differences, so it only trends. Photo regions are
excluded by listing rectangles in `e2e/visual/masks.json` (Figma pixel coordinates); fill it in with the photo frames of 411:169 before using the
percentage as a gate. Qualitative review (side-by-side) is the primary check until then.

## Known remaining deviations (to fix or accept)

1. **Hero:** Figma uses a cut-out portrait that overlaps the section edge; the reference uses a rectangular placeholder. Vertical offsets of the title/buttons/intro are approximate (12-column grid).
2. **Gap section:** photo sizes/positions approximate; Figma shows a heavier flow-lines treatment.
3. **Services:** selected-tab styling and tab spacing are guesses (frame does not show states); floating card position follows the image corner, not the exact Figma offset.
4. **Reasons:** the Figma third pillar has different mock copy; image height follows 461:542.
5. **Process steps:** Figma cards are narrower with different padding; numerals use the H1 gradient.
6. **Photo-quote band, news, estimator:** structure matches; offsets and the estimator card width need a pixel pass.
7. **Header:** height (96 px min) and the active-link underline are estimates; the Figma logo lockup differs slightly from the exported `logo-on-dark` asset.
8. **Digits:** utility-bar text keeps the Arabic-Indic digits of the Figma mock (٥٢٢, ٨٠+); other components use Western digits as the library rules require.

## Intentional deviations

- Photos are neutral placeholders (no licensed imagery in the repository).
- Marquee, tabs and estimator are interactive (Figma is static).
- Sizes below 1024 px and the mobile navigation are team designs (no Figma frames).
