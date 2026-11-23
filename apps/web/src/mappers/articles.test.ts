import { describe, expect, it } from 'vitest';
import { listHref, parsePage, toArticlesProps, toArticleDetailProps, withHeadingIds } from './articles';

const item = { id: '1', slug: 'a', title: 'A', category: 'c', date: '2026-01-01', href: '/articles/a', image: { src: '/a.jpg', alt: 'a' } };

describe('articles list helpers', () => {
    it('builds list URLs without page 1', () => {
        expect(listHref('en', {})).toBe('/en/articles');
        expect(listHref('ar', { category: 'tax', sector: 'retail', page: 3 })).toBe('/ar/articles?category=tax&sector=retail&page=3');
        expect(listHref('ar', { page: 1 })).toBe('/ar/articles');
    });
    it('parses page numbers defensively', () => {
        expect([parsePage(undefined), parsePage('0'), parsePage('-2'), parsePage('x'), parsePage('4')]).toEqual([1, 1, 1, 1, 4]);
    });
    it('hides the featured block on filtered or later pages and marks the active category', () => {
        const api = { hero: { title: 'T' }, featuredTitle: 'f', listEyebrow: 'e', listTitle: 't', featured: [item], items: [item], categories: [{ id: '1', slug: 'tax', name: 'Tax' }], pagination: { page: 1, pageSize: 12, total: 30, totalPages: 3 } };
        expect(toArticlesProps(api, 'en', { page: 1 }).featured).toHaveLength(1);
        const filtered = toArticlesProps(api, 'en', { category: 'tax', page: 1 });
        expect(filtered.featured).toHaveLength(0);
        expect(filtered.categories[0]).toMatchObject({ active: true, href: '/en/articles?category=tax' });
        expect(filtered.pageCount).toBe(3);
        expect(filtered.hrefForPage(2)).toBe('/en/articles?category=tax&page=2');
    });
});

describe('article detail', () => {
    it('adds toc ids to headings in order and keeps existing ids', () => {
        const html = '<h2>One</h2><p>x</p><h3 class="k">Two</h3><h2 id="own">Three</h2>';
        const out = withHeadingIds(html, [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }, { id: 'three', label: 'Three' }]);
        expect(out).toBe('<h2 id="one">One</h2><p>x</p><h3 id="two" class="k">Two</h3><h2 id="own">Three</h2>');
    });
    it('maps a detail payload', () => {
        const d = toArticleDetailProps({ ...item, body: '<h2>One</h2>', toc: [{ id: 'one', label: 'One' }], related: [item], isCaseStory: true }, 'ar');
        expect(d.related[0].href).toBe('/ar/articles/a');
        expect(d.bodyHtml).toContain('id="one"');
        expect(d.isCaseStory).toBe(true);
    });
});
