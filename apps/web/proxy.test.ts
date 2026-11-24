import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { proxy } from './proxy';
import { resetRedirectCache } from './src/lib/redirects';
import { fromAcceptLanguage, negotiateLocale } from './src/lib/i18n/negotiate';

const req = (path: string, headers: Record<string, string> = {}) => new NextRequest(`http://localhost${path}`, { headers });

afterEach(() => {
    delete process.env.MAINTENANCE_MODE;
    vi.unstubAllGlobals();
    resetRedirectCache();
});

// The proxy asks the API for the redirect map; unless a test says otherwise the API is "down" (fails open, no redirects).
beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
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
    it('redirects / to the negotiated locale and remembers it', async () => {
        const res = await proxy(req('/', { 'accept-language': 'en-US,en;q=0.9' }));
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toBe('http://localhost/en');
        expect(res.cookies.get('NEXT_LOCALE')?.value).toBe('en');
    });

    it('uses the cookie over Accept-Language on the root', async () => {
        const res = await proxy(req('/about', { cookie: 'NEXT_LOCALE=ar', 'accept-language': 'en' }));
        expect(res.headers.get('location')).toBe('http://localhost/ar/about');
    });

    it('sets the cookie when the visitor follows a language link', async () => {
        const res = await proxy(req('/en/services', { cookie: 'NEXT_LOCALE=ar' }));
        expect(res.cookies.get('NEXT_LOCALE')?.value).toBe('en');
        expect(res.cookies.get('NEXT_LOCALE')?.maxAge).toBe(31536000);
    });

    it('does not touch the cookie when it already matches', async () => {
        const res = await proxy(req('/ar', { cookie: 'NEXT_LOCALE=ar' }));
        expect(res.cookies.get('NEXT_LOCALE')).toBeUndefined();
    });

    it('serves a 503 localised page in maintenance mode', async () => {
        process.env.MAINTENANCE_MODE = 'true';
        const res = await proxy(req('/en/about'));
        expect(res.status).toBe(503);
        expect(res.headers.get('retry-after')).toBe('3600');
        expect(await res.text()).toContain('Down for maintenance');
    });

    it('marks preview requests noindex and uncached', async () => {
        const res = await proxy(req('/ar/services', { cookie: 'cpa_preview=1' }));
        expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
        expect(res.headers.get('cache-control')).toBe('private, no-store');
        expect((await proxy(req('/ar/services', {}))).headers.get('x-robots-tag')).toBeNull();
    });

    it('sends a legacy URL to its new path with 308, keeping the query string', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ '/old-services/audit': { to: '/ar/services/audit', type: 'permanent' } }))));
        const res = await proxy(req('/Old-Services/audit/?utm=x'));
        expect(res.status).toBe(308);
        expect(res.headers.get('location')).toBe('http://localhost/ar/services/audit?utm=x');
    });

    it('uses 307 for temporary redirects and passes absolute targets through', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ '/promo': { to: 'https://example.org/p', type: 'temporary' } }))));
        const res = await proxy(req('/promo'));
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toBe('https://example.org/p');
    });

    it('ignores an invalid map and keeps serving pages', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ '/x': 'nope' }))));
        const res = await proxy(req('/ar/about'));
        expect(res.status).toBe(200);
    });

    it('adds a CSP with a fresh nonce in production and none in development', async () => {
        const env = process.env as Record<string, string | undefined>;
        const before = { NODE_ENV: env.NODE_ENV, CSP_MODE: env.CSP_MODE };
        env.NODE_ENV = 'production';
        env.CSP_MODE = 'enforce';
        try {
            const a = await proxy(req('/ar/about'));
            const b = await proxy(req('/ar/about'));
            const csp = a.headers.get('content-security-policy') ?? '';
            expect(csp).toMatch(/script-src[^;]*'nonce-[A-Za-z0-9+/=]+'/);
            expect(csp).not.toBe(b.headers.get('content-security-policy'));
            expect(a.headers.get('x-content-type-options')).toBe('nosniff');
        } finally {
            env.NODE_ENV = before.NODE_ENV;
            env.CSP_MODE = before.CSP_MODE;
        }
        expect((await proxy(req('/ar/about'))).headers.get('content-security-policy')).toBeNull();
    });

    it('reports a served redirect to the API under the stored key, without waiting for it', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(new Response(JSON.stringify({ '/services/old': { to: '/services/new', type: 'permanent' } })))
            .mockResolvedValue(new Response(null, { status: 204 }));
        vi.stubGlobal('fetch', fetchMock);
        const res = await proxy(req('/en/services/old'));
        expect(res.headers.get('location')).toBe('http://localhost/en/services/new');
        const hit = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/api/redirects/hit'));
        expect(hit).toBeDefined();
        expect(JSON.parse(String((hit?.[1] as RequestInit).body))).toEqual({ path: '/services/old' });
    });
});
