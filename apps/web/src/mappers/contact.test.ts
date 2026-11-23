import { describe, expect, it } from 'vitest';
import { toContactProps, type ContactPageApi } from './contact';

const api: ContactPageApi = {
    hero: { title: 'T' },
    intro: { eyebrow: 'e', title: 't', body: 'b' },
    form: { title: 'f', subtitle: 's', successTitle: 'ok', successBody: 'b' },
    offices: { eyebrow: 'o', title: 'Offices', items: [{ city: 'Riyadh', address: 'a', mapHref: 'https://m.test', coordinates: { x: 10, y: 20 } }, { city: 'Qassim', address: 'b' }] },
    faq: { eyebrow: 'q', title: 'FAQ', items: [{ id: '1', question: 'q', answer: 'a' }] },
    serviceOptions: [{ id: '1', slug: 'audit', title: 'Audit' }],
};

describe('contact mapper', () => {
    it('labels map links only for offices that have one', () => {
        const p = toContactProps(api, 'en', 'Directions', []);
        expect(p.offices.items.map((o) => o.mapLabel)).toEqual(['Directions', undefined]);
        expect(p.serviceOptions).toHaveLength(1);
    });
    it('accepts the offices block as a bare array', () => {
        const p = toContactProps({ ...api, offices: [{ city: 'X', address: 'y' }] }, 'ar', 'x', []);
        expect(p.offices.items).toHaveLength(1);
        expect(p.offices.mapImage).toBeUndefined();
    });
});
