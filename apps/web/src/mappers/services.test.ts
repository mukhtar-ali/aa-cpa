import { describe, expect, it } from 'vitest';
import { contactHref, toServiceDetailProps, toServicesProps } from './services';

describe('services mapper', () => {
    it('builds service hrefs from the slug when the API sends none, with the locale', () => {
        const p = toServicesProps({ hero: { title: 'T' }, statement: 's', items: [{ id: '1', slug: 'external-audit', title: 'A', summary: 'x' }] }, 'en', 'Learn more');
        expect(p.services[0]).toMatchObject({ href: '/en/services/external-audit', ctaLabel: 'Learn more' });
        expect(p.hero.image).toBeUndefined();
    });
    it('carries the service into the contact link', () => {
        expect(contactHref('ar', 'external-audit')).toBe('/ar/contact?service=external-audit');
    });
    it('maps a detail payload with missing optional parts', () => {
        const d = toServiceDetailProps({ id: '1', slug: 's', title: 'T', summary: 'sum', methodology: [{ title: 'a', body: 'b' }], deliverables: [] }, 'ar');
        expect(d.subtitle).toBe('sum');
        expect(d.faqs).toEqual([]);
        expect(d.methodology).toHaveLength(1);
    });
});
