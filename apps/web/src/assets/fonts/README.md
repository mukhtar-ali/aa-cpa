# Self-hosted fonts

Bundled so `next build` never needs to reach Google Fonts (a blocked or flaky network on the build server used to fail
the whole web image build with "Failed to fetch `Inter` from Google Fonts"), and so visitors' browsers do not call Google.

| File | Font | Subset | Source |
|---|---|---|---|
| `inter-latin-wght-normal.woff2` | Inter (variable, weight 100-900) | latin | `@fontsource-variable/inter` 5.3.0 |
| `cairo-latin-wght-normal.woff2` | Cairo (variable, weight 200-1000) | latin | `@fontsource-variable/cairo` 5.3.0 |
| `cairo-arabic-wght-normal.woff2` | Cairo (variable, weight 200-1000) | arabic | `@fontsource-variable/cairo` 5.3.0 |

Both fonts are licensed under the SIL Open Font License 1.1 (see the `LICENSE-*.txt` files). To update, download the same
files from a newer fontsource release; `app/[lang]/layout.tsx` references them by name.
