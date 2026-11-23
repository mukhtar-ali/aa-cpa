# Homepage parity: reference page vs Figma 411:169 (task T108)

Tool: `node e2e/visual/figma-diff.mjs` (Figma 1x export `e2e/visual/figma/home-1512.png` vs `/ar/reference/home` at 1512 px, Chrome).
Run with `ENABLE_REFERENCE_PAGES=true` on the web app, for example `PW_CHANNEL=chrome node e2e/visual/figma-diff.mjs --url http://localhost:3100/ar/reference/home`.

## Status (2026-11-22)

| Pass | Differing pixels | Page height vs Figma | What changed |
| --- | --- | --- | --- |
| 1 | 69.4 % | 709 px shorter | first composition |
| 2 | 50.5 % | 210 px taller | hero gradient title, utility bar order, logo marquee, ice services band, gap statement gradient |
| 3 | 22.5 % -> 14.9 % | 0 | photo masks from the Figma frames, section heights from the frame (page height 7952 px = Figma), Container and section widths now include gutters (content is 1140 px as in Figma), quote band 720 px photo column |
| 4 | 10.8 % | 0 | ServiceTabs two-column layout with headline and accent, process cards transparent with a split heading, why-us layout (heading row, then cards and the 461 px photo) with the Figma card copy, hero portrait 630 x 498 px, one language switch, estimator 560 px card, news band on ice with a view-all button |

The 5 % gate (`figma-diff.mjs --max-diff-pct 5`) is **not met**. Photos are masked, so what remains is not the photos themselves but text
anti-aliasing and font rasterisation (the largest single source: every paragraph differs by a pixel or two), the header logo lock-up
(placeholder logo), the hero cut-out portrait, and small offsets inside sections. The table of bands in `e2e/visual/out/stats.json`
shows the hero and the "why us" band as the largest (13 to 23 %).

## Known remaining deviations (accepted for 001, listed for the designer)

1. **Hero:** Figma uses a cut-out portrait whose head overlaps the section edge; the reference uses a rectangular placeholder photo at the right position and size (630 x 498 px, 254 px from the inline start). Title, buttons and intro offsets follow a 12-column grid and are within a few pixels.
2. **Gap section:** the heavier flow-lines treatment of Figma is lighter in the reference.
3. **Services:** selected-tab and hover styles are team-designed (the frame shows only the default state); the floating "24 hours" card follows the image corner, not an exact Figma offset.
4. **Process steps:** numeral gradient and card padding differ by a few pixels.
5. **Header:** height and the active-link style are estimates; the Figma logo lock-up differs from the exported `logo-on-dark` asset (placeholder wordmark).
6. **Digits:** the utility bar keeps the Arabic-Indic digits of the Figma mock; other components use Western digits as the library rules require.
7. **Text rendering:** Figma exports render the Almarai glyphs with different anti-aliasing; every text block adds a thin band of differing pixels. This sets a floor on the percentage that no layout change can remove.

Closing T108 at 10.8 % is a decision for the designer: the remaining difference is rendering and placeholder content, not layout.

## Intentional deviations

- Photos are neutral placeholders (no licensed imagery in the repository).
- Marquee, tabs and estimator are interactive (Figma is static).
- Sizes below 1024 px and the mobile navigation are team designs (no Figma frames).
