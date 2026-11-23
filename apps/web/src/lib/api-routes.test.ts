import { beforeEach, describe, expect, it, vi } from 'vitest';

const revalidateTag = vi.fn();
vi.mock('next/cache', () => ({ revalidateTag: (...a: unknown[]) => revalidateTag(...a) }));

import { GET as health } from '../../app/api/health/route';
import { POST as revalidate } from '../../app/api/revalidate/route';

const call = (body: unknown, secret?: string) =>
    revalidate(new Request('http://x.test/api/revalidate', { method: 'POST', headers: secret ? { 'x-revalidate-secret': secret } : {}, body: JSON.stringify(body) }));

describe('POST /api/revalidate', () => {
    beforeEach(() => {
        revalidateTag.mockClear();
        process.env.WEB_REVALIDATE_SECRET = 'topsecret';
    });
    it('rejects a missing or wrong secret without revalidating', async () => {
        expect((await call({ tags: ['chrome'] })).status).toBe(401);
        expect((await call({ tags: ['chrome'] }, 'nope')).status).toBe(401);
        expect(revalidateTag).not.toHaveBeenCalled();
    });
    it('rejects invalid tag lists', async () => {
        for (const tags of [[], ['Bad Tag'], ['ok', 5], 'chrome', Array.from({ length: 51 }, (_, i) => `t${i}`.replace(/\d/g, 'x'))]) expect((await call({ tags }, 'topsecret')).status).toBe(400);
    });
    it('revalidates each distinct tag', async () => {
        const res = await call({ tags: ['service:external-audit', 'chrome', 'chrome'] }, 'topsecret');
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ revalidated: ['service:external-audit', 'chrome'] });
        expect(revalidateTag).toHaveBeenCalledTimes(2);
    });
    it('is closed when no secret is configured', async () => {
        delete process.env.WEB_REVALIDATE_SECRET;
        expect((await call({ tags: ['chrome'] }, '')).status).toBe(401);
    });
});

describe('GET /api/health', () => {
    it('reports ok with a version', async () => {
        const res = health();
        expect(await res.json()).toMatchObject({ status: 'ok', version: expect.any(String) });
    });
});
