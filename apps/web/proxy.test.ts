import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';
import { proxy } from './proxy';
import { fromAcceptLanguage, negotiateLocale } from './src/lib/i18n/negotiate';

const req = (path: string, headers: Record<string, string> = {}) => new NextRequest(`http://localhost${path}`, { headers });

afterEach(() => {
    delete process.env.MAINTENANCE_MODE;
});

describe('locale negotiation (research R5)', () => {
    it('cookie beats Accept-Language, which beats the Arabic default', () => {
        expect(negotiateLocale({ cookie: 'en', acceptLanguage: 'ar' })).toBe('en');
        expect(negotiateLocale({ cookie: 'xx', acceptLanguage: 'en-GB,en;q=0.9' })).toBe('en');
        expect(negotiateLocale({})).toBe('ar');
        expect(fromAcceptLanguage('fr,de;q=0.8')).toBe('ar');
        expect(fromAcceptLanguage('*')).toBe('ar');
        expect(fromAcceptLanguage('!!!bad')).toBe('ar');
    });
});

describe('proxy', () => {
    it('redirects / to the negotiated locale and remembers it', () => {
        const res = proxy(req('/', { 'accept-language': 'en-US,en;q=0.9' }));
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toBe('http://localhost/en');
        expect(res.cookies.get('NEXT_LOCALE')?.value).toBe('en');
    });

    it('uses the cookie over Accept-Language on the root', () => {
        const res = proxy(req('/about', { cookie: 'NEXT_LOCALE=ar', 'accept-language': 'en' }));
        expect(res.headers.get('location')).toBe('http://localhost/ar/about');
    });

    it('sets the cookie when the visitor follows a language link', () => {
        const res = proxy(req('/en/services', { cookie: 'NEXT_LOCALE=ar' }));
        expect(res.cookies.get('NEXT_LOCALE')?.value).toBe('en');
        expect(res.cookies.get('NEXT_LOCALE')?.maxAge).toBe(31536000);
    });

    it('does not touch the cookie when it already matches', () => {
        const res = proxy(req('/ar', { cookie: 'NEXT_LOCALE=ar' }));
        expect(res.cookies.get('NEXT_LOCALE')).toBeUndefined();
    });

    it('serves a 503 localised page in maintenance mode', async () => {
        process.env.MAINTENANCE_MODE = 'true';
        const res = proxy(req('/en/about'));
        expect(res.status).toBe(503);
        expect(res.headers.get('retry-after')).toBe('3600');
        expect(await res.text()).toContain('Down for maintenance');
    });
});
