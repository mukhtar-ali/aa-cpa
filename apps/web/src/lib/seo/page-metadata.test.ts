import { afterEach, describe, expect, it } from 'vitest';
import { buildMetadata } from './page-metadata';

describe('buildMetadata', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    it('builds absolute canonical, alternates with x-default = ar, OG and Twitter card', () => {
        const m = buildMetadata({
            lang: 'en',
            path: '/services/audit',
            fallbackTitle: 'Audit',
            seo: { metaTitle: 'Audit | AA', ogImage: 'https://x/og.png' },
        });
        expect(m.title).toBe('Audit | AA');
        expect(m.alternates?.canonical).toBe('http://localhost:3000/en/services/audit');
        expect(m.alternates?.languages).toEqual({
            ar: 'http://localhost:3000/ar/services/audit',
            en: 'http://localhost:3000/en/services/audit',
            'x-default': 'http://localhost:3000/ar/services/audit',
        });
        expect(m.openGraph).toMatchObject({
            locale: 'en_US',
            alternateLocale: ['ar_SA'],
            images: [{ url: 'https://x/og.png', width: 1200, height: 630 }],
        });
        expect(m.twitter).toMatchObject({
            card: 'summary_large_image',
            title: 'Audit | AA',
            images: ['https://x/og.png'],
        });
        expect(m.robots).toBeUndefined();
    });

    it('formats title as {title} | {site name} when no pipe exists', () => {
        const m = buildMetadata({
            lang: 'en',
            path: '/services',
            fallbackTitle: 'Our Services',
            siteName: 'AA-CPA',
        });
        expect(m.title).toBe('Our Services | AA-CPA');
    });

    it('falls back to the given title and honours an explicit CMS canonical', () => {
        const m = buildMetadata({
            lang: 'ar',
            path: '',
            fallbackTitle: 'الرئيسية',
            seo: { metaTitle: ' ', canonicalUrl: 'https://x/ar' },
        });
        expect(m.title).toBe('الرئيسية');
        expect(m.alternates?.canonical).toBe('https://x/ar');
        expect(m.openGraph).toMatchObject({
            locale: 'ar_SA',
            alternateLocale: ['en_US'],
        });
    });

    it('falls back to dynamic API OG image generator when no ogImage is set in CMS', () => {
        const m = buildMetadata({
            lang: 'ar',
            path: '/about',
            fallbackTitle: 'من نحن',
        });
        expect(m.openGraph?.images).toEqual([
            {
                url: 'http://localhost:3001/api/og?type=page&key=about&lang=ar',
                width: 1200,
                height: 630,
                alt: 'من نحن | عبدالرحمن الشبيبشيري للاستشارات المهنية',
            },
        ]);
        expect(m.twitter?.images).toEqual([
            'http://localhost:3001/api/og?type=page&key=about&lang=ar',
        ]);
    });

    it('is never indexable in preview or when the CMS says noindex', () => {
        expect(buildMetadata({ lang: 'ar', path: '', fallbackTitle: 't', preview: true }).robots).toEqual({ index: false, follow: false });
        expect(buildMetadata({ lang: 'ar', path: '', fallbackTitle: 't', seo: { noindex: true } }).robots).toEqual({ index: false, follow: false });
    });

    it('sets noindex when APP_ENV is set and is not production', () => {
        process.env = { ...originalEnv, APP_ENV: 'staging' };
        expect(buildMetadata({ lang: 'ar', path: '', fallbackTitle: 't' }).robots).toEqual({ index: false, follow: false });

        process.env = { ...originalEnv, APP_ENV: 'production' };
        expect(buildMetadata({ lang: 'ar', path: '', fallbackTitle: 't' }).robots).toBeUndefined();
    });

    it('lists only the available languages but keeps x-default on ar', () => {
        const m = buildMetadata({ lang: 'ar', path: '/a', fallbackTitle: 't', languages: ['ar'] });
        expect(m.alternates?.languages).toEqual({
            ar: 'http://localhost:3000/ar/a',
            'x-default': 'http://localhost:3000/ar/a',
        });
    });

    it('never ships without a description: CMS, then the page fallback, then the dictionary default for that section', () => {
        const base = { lang: 'en' as const, fallbackTitle: 't' };
        expect(buildMetadata({ ...base, path: '/about', seo: { metaDescription: 'From the CMS' } }).description).toBe('From the CMS');
        expect(buildMetadata({ ...base, path: '/about', fallbackDescription: 'Page summary' }).description).toBe('Page summary');
        expect(buildMetadata({ ...base, path: '/about', fallbackDescription: '  ' }).description).toMatch(/Abdulrahman/);
        expect(buildMetadata({ ...base, path: '' }).description).toMatch(/SOCPA/);
        expect(buildMetadata({ ...base, path: '/services/external-audit' }).description).toMatch(/Audit, zakat/);
        expect(buildMetadata({ ...base, path: '/something-new' }).description).toMatch(/SOCPA/);
        expect(buildMetadata({ lang: 'ar', fallbackTitle: 't', path: '/contact' }).description?.length).toBeGreaterThan(40);
    });
});
