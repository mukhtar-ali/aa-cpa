import { describe, expect, it } from 'vitest';
import { buildMetadata } from './page-metadata';

describe('buildMetadata', () => {
    it('builds canonical, alternates with x-default = ar, and OG basics', () => {
        const m = buildMetadata({ lang: 'en', path: '/services/audit', fallbackTitle: 'Audit', seo: { metaTitle: 'Audit | AA', ogImage: 'https://x/og.png' } });
        expect(m.title).toBe('Audit | AA');
        expect(m.alternates?.canonical).toBe('/en/services/audit');
        expect(m.alternates?.languages).toEqual({ ar: '/ar/services/audit', en: '/en/services/audit', 'x-default': '/ar/services/audit' });
        expect(m.openGraph).toMatchObject({ locale: 'en_US', images: ['https://x/og.png'] });
        expect(m.robots).toBeUndefined();
    });

    it('falls back to the given title and honours a CMS canonical', () => {
        const m = buildMetadata({ lang: 'ar', path: '', fallbackTitle: 'الرئيسية', seo: { metaTitle: ' ', canonicalUrl: 'https://x/ar' } });
        expect(m.title).toBe('الرئيسية');
        expect(m.alternates?.canonical).toBe('https://x/ar');
        expect(m.openGraph).toMatchObject({ locale: 'ar_SA' });
    });

    it('is never indexable in preview or when the CMS says noindex', () => {
        expect(buildMetadata({ lang: 'ar', path: '', fallbackTitle: 't', preview: true }).robots).toEqual({ index: false, follow: false });
        expect(buildMetadata({ lang: 'ar', path: '', fallbackTitle: 't', seo: { noindex: true } }).robots).toEqual({ index: false, follow: false });
    });

    it('lists only the available languages but keeps x-default on ar', () => {
        const m = buildMetadata({ lang: 'ar', path: '/a', fallbackTitle: 't', languages: ['ar'] });
        expect(m.alternates?.languages).toEqual({ ar: '/ar/a', 'x-default': '/ar/a' });
    });
});
