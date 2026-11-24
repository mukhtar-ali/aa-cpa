import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FONT_STACK, renderOgSvg } from './og.template';

describe('renderOgSvg', () => {
    it('anchors Arabic text logically (librsvg mirrors start/end for rtl) so nothing runs off the canvas', () => {
        const svg = renderOgSvg({ lang: 'ar', title: 'خدمات المراجعة الخارجية', eyebrow: 'الخدمات' });
        expect(svg).toContain('direction="rtl"');
        // Title and eyebrow start at the right margin (x=1110) with the logical start anchor.
        expect(svg).toMatch(/<text x="1110" y="\d+" text-anchor="start"[^>]*direction="rtl"/);
        // The network badge ends at the left margin (x=90) under rtl, which places it to the right of x=90.
        expect(svg).toMatch(/<text x="90" y="555" text-anchor="end"[^>]*direction="rtl"/);
        expect(svg).not.toContain('text-anchor="end" font-family="${FONT_STACK}"');
    });

    it('left-aligns English text at the left margin', () => {
        const svg = renderOgSvg({ lang: 'en', title: 'External audit', eyebrow: 'Services' });
        expect(svg).toMatch(/<text x="90" y="\d+" text-anchor="start"[^>]*direction="ltr"/);
    });

    it('names fonts that the API image installs (Arabic-capable first)', () => {
        expect(FONT_STACK.split(',')[0].trim()).toMatch(/Arabic/);
        expect(renderOgSvg({ lang: 'ar', title: 'x' })).toContain(`font-family="${FONT_STACK}"`);
    });

    it('only uses brand colours that exist in the design-system tokens (the template cannot import them, so this guards drift)', () => {
        const tokens = readFileSync(resolve(__dirname, '../../../../packages/design-system/src/styles/tokens.css'), 'utf8').toLowerCase();
        const svg = renderOgSvg({ lang: 'en', title: 'x', eyebrow: 'y' });
        const brand = new Set((svg.match(/#[0-9a-f]{6}\b/gi) ?? []).map((c) => c.toLowerCase()));
        const missing = [...brand].filter((c) => !tokens.includes(c));
        // Neutral text/glow tints that are not named tokens are listed here on purpose; anything new must be a token.
        const allowed = ['#ffffff', '#77c0a1', '#a9b0aa', '#164c62'];
        expect(missing.filter((c) => !allowed.includes(c))).toEqual([]);
    });
});
