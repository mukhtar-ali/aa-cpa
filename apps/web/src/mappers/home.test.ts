import { describe, expect, it } from 'vitest';
import { toHomeProps, type HomeApi } from './home';

const api: HomeApi = {
    hero: { title: 'T', body: 'B', actions: [{ label: 'a', href: '/contact', variant: 'outline-light' }, { label: 'b', href: 'https://x.test', external: true }], image: { src: '/h.jpg', alt: 'h' } },
    gap: { statement: 's', eyebrow: 'e', body: 'b', images: [{ src: '/g.jpg' }] },
    clients: { rows: [[{ name: 'A', image: { src: '/a.svg', alt: 'A' } }], []] },
    services: { eyebrow: 'e', title: 't', intro: 'i', ctaLabel: 'c', items: [{ id: '1', title: 'S', summary: 'x', href: '/services/audit', image: { src: '/s.jpg', alt: 's' } }] },
    reasons: { title: 'r', description: 'd', pillars: [], stats: [] },
    credentials: { title: 'c' },
    process: { eyebrow: 'e', title: 't', description: 'd', steps: [{ title: 'one', body: 'b' }, { index: 5, title: 'two', body: 'b' }] },
    partnerQuote: { title: 'q', body: 'b' },
    news: [{ id: 'n', title: 'N', category: 'c', date: '2026-01-01', href: '/articles/n', image: { src: '/n.jpg', alt: 'n' } }],
};

describe('toHomeProps', () => {
    it('localises hrefs, maps the outline-light variant and keeps external links', () => {
        const p = toHomeProps(api, 'en');
        expect(p.hero.actions[0]).toMatchObject({ href: '/en/contact', variant: 'paper' });
        expect(p.hero.actions[1].href).toBe('https://x.test');
        expect(p.services.items[0].href).toBe('/en/services/audit');
        expect(p.news.articles[0].href).toBe('/en/articles/n');
    });
    it('numbers process steps and drops empty marquee rows', () => {
        const p = toHomeProps(api, 'ar');
        expect(p.process.steps.map((s) => s.index)).toEqual([1, 5]);
        expect(p.marquee.rows).toHaveLength(1);
    });
    it('accepts the services block as a bare array', () => {
        const p = toHomeProps({ ...api, services: [{ id: '1', title: 'S', summary: 'x' }] }, 'ar');
        expect(p.services.head).toBeNull();
        expect(p.services.items).toHaveLength(1);
    });
});
