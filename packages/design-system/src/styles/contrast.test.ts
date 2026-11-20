import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const doc = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, '../../tokens/figma-variables.json'), 'utf8'),
) as { variables: { name: string; value: string }[] };

const colour = (name: string): string => {
  const v = doc.variables.find((x) => x.name === name);
  if (!v) throw new Error(`Unknown token ${name}`);
  return v.value.toLowerCase();
};

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const LIGHT = ['bg/page', 'bg/surface-ice', 'bg/surface'];
const DARK = ['bg/inverse', 'bg/inverse-raised', 'bg/hero', 'pine/900'];

type Pair = { fg: string; bg: string[]; min: number; note: string };
const pairs: Pair[] = [
  { fg: 'text/heading', bg: [...LIGHT, 'neutral/50'], min: 4.5, note: 'headings' },
  { fg: 'text/body', bg: [...LIGHT, 'neutral/50'], min: 4.5, note: 'body copy' },
  { fg: 'text/strong', bg: LIGHT, min: 4.5, note: 'strong text' },
  { fg: 'text/muted', bg: LIGHT, min: 4.5, note: 'R4 muted' },
  { fg: 'text/link', bg: LIGHT, min: 4.5, note: 'R4 link' },
  { fg: 'neutral/500', bg: [...LIGHT, 'neutral/50'], min: 4.5, note: 'placeholder / helper' },
  { fg: 'text/accent', bg: LIGHT, min: 4.5, note: 'gold accent text on light' },
  { fg: 'status/error', bg: [...LIGHT, 'neutral/50'], min: 4.5, note: 'error text' },
  { fg: 'gradient/end-text-large', bg: LIGHT, min: 3.0, note: 'R4 large accent text' },
  { fg: 'gradient/end-text', bg: LIGHT, min: 4.5, note: 'R4 small accent text' },
  { fg: 'text/inverse', bg: DARK, min: 4.5, note: 'text on dark' },
  { fg: 'text/inverse-muted', bg: ['bg/inverse', 'bg/inverse-raised'], min: 4.5, note: 'muted on dark' },
  { fg: 'text/accent-inverse', bg: ['bg/inverse', 'bg/inverse-raised'], min: 4.5, note: 'gold on dark' },
  { fg: 'accent/progress', bg: ['bg/inverse'], min: 4.5, note: 'R4 progress accent' },
  { fg: 'icon/accent', bg: ['bg/inverse'], min: 3.0, note: 'icon (non-text)' },
  { fg: 'text/on-action', bg: ['action/primary'], min: 4.5, note: 'R4 button label' },
  { fg: 'border/strong', bg: LIGHT, min: 3.0, note: 'form control border (non-text)' },
  { fg: 'emerald/600', bg: ['bg/surface'], min: 3.0, note: 'focus border (non-text)' },
  { fg: 'action/primary', bg: LIGHT, min: 3.0, note: 'focus ring (non-text)' },
];

describe('WCAG contrast of shipped token pairs', () => {
  it('helper reproduces known R4 ratios', () => {
    expect(contrast('#ffffff', '#228664')).toBeCloseTo(4.5, 1);
    expect(contrast(colour('text/muted'), colour('bg/page'))).toBeCloseTo(4.56, 1);
  });

  for (const p of pairs) {
    for (const bg of p.bg) {
      it(`${p.fg} on ${bg} >= ${p.min} (${p.note})`, () => {
        // Compare with a 0.005 tolerance for 2-decimal rounding in the research table (e.g. 4.50 exactly)
        expect(contrast(colour(p.fg), colour(bg))).toBeGreaterThanOrEqual(p.min - 0.005);
      });
    }
  }
});
