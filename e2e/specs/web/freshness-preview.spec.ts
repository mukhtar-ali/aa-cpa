import crypto from 'node:crypto';
import { expect, test } from '@playwright/test';

// US6: on-demand revalidation, preview of drafts, expired/forged tokens. Needs the web app running with
// WEB_REVALIDATE_SECRET and PREVIEW_SECRET set (the same values are passed here as env vars).
const SECRET = process.env.PREVIEW_SECRET ?? '';
const REVALIDATE = process.env.WEB_REVALIDATE_SECRET ?? '';

const token = (exp: number, secret = SECRET) => {
    const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const p = Buffer.from(JSON.stringify({ kind: 'page', key: 'home', exp })).toString('base64url');
    return `${h}.${p}.${crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url')}`;
};
const soon = () => Math.floor(Date.now() / 1000) + 600;

test.describe('revalidation', () => {
    test.skip(!REVALIDATE, 'set WEB_REVALIDATE_SECRET');
    test('rejects a bad secret and accepts a tag list', async ({ request }) => {
        expect((await request.post('/api/revalidate', { data: { tags: ['chrome'] }, headers: { 'x-revalidate-secret': 'wrong' } })).status()).toBe(401);
        const ok = await request.post('/api/revalidate', { data: { tags: ['chrome'] }, headers: { 'x-revalidate-secret': REVALIDATE } });
        expect(ok.status()).toBe(200);
    });
});

test.describe('preview', () => {
    test.skip(!SECRET, 'set PREVIEW_SECRET');
    test('an expired token is refused and draft mode stays off', async ({ page }) => {
        const res = await page.request.get(`/api/preview?token=${encodeURIComponent(token(1))}&path=/en`, { maxRedirects: 0 });
        expect(res.status()).toBe(401);
        await page.goto('/en');
        await expect(page.getByText(/preview/i)).toHaveCount(0);
    });

    test('a forged token is refused', async ({ request }) => {
        const res = await request.get(`/api/preview?token=${encodeURIComponent(token(soon(), 'other'))}&path=/en`, { maxRedirects: 0 });
        expect(res.status()).toBe(401);
    });

    test('an open redirect target is refused', async ({ request }) => {
        const res = await request.get(`/api/preview?token=${encodeURIComponent(token(soon()))}&path=//evil.example`, { maxRedirects: 0 });
        // A bad path falls back to the page derived from the token, never to the attacker's URL.
        expect([307, 400]).toContain(res.status());
        expect(res.headers()['location'] ?? '').not.toContain('evil.example');
    });

    test('a valid token shows the banner, noindex, and exit removes it', async ({ page }) => {
        await page.goto(`/api/preview?token=${encodeURIComponent(token(soon()))}&path=/en`);
        await expect(page).toHaveURL(/\/en$/);
        await expect(page.getByRole('link', { name: /exit/i })).toBeVisible();
        const res = await page.request.get('/en');
        expect(res.headers()['x-robots-tag']).toContain('noindex');
        await page.getByRole('link', { name: /exit/i }).click();
        await expect(page.getByRole('link', { name: /exit/i })).toHaveCount(0);
    });
});

test('health endpoint answers ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
});
