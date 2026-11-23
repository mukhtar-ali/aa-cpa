import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, apiGet, apiPost } from './client';

const ok = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

afterEach(() => vi.restoreAllMocks());

describe('apiGet', () => {
    it('sends language, accept-language and tags, and parses with the schema', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok({ a: 1 }));
        const data = await apiGet('/api/x', { lang: 'en', tags: ['x'], query: { page: 2, q: undefined }, schema: z.object({ a: z.number() }) });
        expect(data).toEqual({ a: 1 });
        const [url, init] = spy.mock.calls[0] as [string, RequestInit & { next?: { tags: string[] } }];
        expect(url).toContain('/api/x?lang=en&page=2');
        expect(url).not.toContain('q=');
        expect((init.headers as Record<string, string>)['Accept-Language']).toBe('en');
        expect(init.next?.tags).toEqual(['x']);
    });

    it('preview mode sends the token and disables caching', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok({}));
        await apiGet('/api/x', { lang: 'ar', preview: 'tok' });
        const init = spy.mock.calls[0][1] as RequestInit;
        expect((init.headers as Record<string, string>)['X-Preview-Token']).toBe('tok');
        expect(init.cache).toBe('no-store');
    });

    it('throws a typed not-found error on 404', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok({}, 404));
        const error = (await apiGet('/api/x', { lang: 'ar' }).catch((e) => e)) as ApiError;
        expect(error).toBeInstanceOf(ApiError);
        expect(error.isNotFound).toBe(true);
    });

    it('throws a contract error when the response does not match the schema', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok({ a: 'nope' }));
        const error = (await apiGet('/api/x', { lang: 'ar', schema: z.object({ a: z.number() }) }).catch((e) => e)) as ApiError;
        expect(error.kind).toBe('contract');
    });

    it('maps a timeout and a network failure', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(Object.assign(new Error('t'), { name: 'TimeoutError' }));
        expect(((await apiGet('/a', { lang: 'ar' }).catch((e) => e)) as ApiError).kind).toBe('timeout');
        vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('fetch failed'));
        expect(((await apiGet('/a', { lang: 'ar' }).catch((e) => e)) as ApiError).kind).toBe('network');
    });
});

describe('apiPost', () => {
    it('collects field errors and forwards the visitor IP without throwing on 422', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            ok({ message: 'bad', errors: [{ email: 'Invalid email' }, { mobile: 'Required' }] }, 422),
        );
        const result = await apiPost('/api/contact', '{}', { lang: 'en', clientIp: '1.2.3.4', json: true });
        expect(result.ok).toBe(false);
        expect(result.fieldErrors).toEqual({ email: 'Invalid email', mobile: 'Required' });
        expect((spy.mock.calls[0][1] as RequestInit).headers).toMatchObject({ 'X-Forwarded-For': '1.2.3.4' });
    });
});
