import { describe, expect, it } from 'vitest';
import { isLegalKey, toLegalProps } from './legal';
import { sectorArticlesHref, toSectorsProps } from './sectors';

describe('sectors mapper', () => {
    it('links each sector to its articles', () => {
        expect(sectorArticlesHref('en', 'oil-gas')).toBe('/en/articles?sector=oil-gas');
        const p = toSectorsProps({ hero: { title: 'T' }, statement: 's', indexTitle: 'i', indexDescription: 'd', items: [{ id: '1', slug: 'retail', title: 'Retail', summary: 'x' }] }, 'ar');
        expect(p.index.sectors[0].href).toBe('/ar/articles?sector=retail');
    });
});

describe('legal mapper', () => {
    it('accepts only known legal keys', () => {
        expect(isLegalKey('privacy')).toBe(true);
        expect(isLegalKey('cookies')).toBe(false);
    });
    it('maps sections to html and the pdf to the download link', () => {
        const p = toLegalProps({ version: '1', updatedAt: '2026-11-18', hero: { title: 'P' }, summary: ['a'], sections: [{ id: 'one', title: 'One', body: '<p>x</p>' }], pdfUrl: '/p.pdf' }, 'en');
        expect(p.document.sections[0].html).toBe('<p>x</p>');
        expect(p.document.downloadHref).toBe('/p.pdf');
    });
});
