import { describe, expect, it } from 'vitest';
import { clientRows, toAboutProps, type AboutApi } from './about';

const base: AboutApi = {
    hero: { title: 'T', image: { src: '/h.jpg' }, breadcrumbs: [{ label: 'Home', href: '/' }] },
    statement: 's',
    licenceBody: 'b',
    commitments: { title: 'c', items: [{ title: 'one', body: 'x' }] },
    offices: [{ city: 'Riyadh', address: 'a', mapHref: 'https://maps.test/x' }, { city: 'Qassim', address: 'b' }],
};

describe('about mapper', () => {
    it('localises breadcrumbs and adds the map label only to offices with a link', () => {
        const p = toAboutProps(base, 'en', 'Get directions');
        expect(p.hero.breadcrumbs?.[0].href).toBe('/en');
        expect(p.offices.items[0].mapLabel).toBe('Get directions');
        expect(p.offices.items[1].mapLabel).toBeUndefined();
    });
    it('splits clients into two rows by CMS row, else alternating, and drops empty rows', () => {
        expect(clientRows([{ name: 'a' }, { name: 'b' }, { name: 'c' }]).map((r) => r.length)).toEqual([2, 1]);
        expect(clientRows([{ name: 'a', row: 2 }])).toHaveLength(1);
    });
    it('omits the signatory and quote when the CMS has none', () => {
        const p = toAboutProps(base, 'ar', 'x');
        expect(p.signatory).toBeUndefined();
        expect(p.quote).toBeUndefined();
    });
});
