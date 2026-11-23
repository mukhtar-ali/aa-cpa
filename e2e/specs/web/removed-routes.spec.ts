import { expect, test } from '@playwright/test';

// US7: the real-estate starter is gone. Its URLs must end on the designed 404 page, and /news must still lead to articles.
const REMOVED = ['/ar/projects', '/en/projects', '/ar/projects/some-project', '/en/some-project/units/some-unit', '/en/communities', '/en/investor-relations'];

test.describe('removed starter routes', () => {
    for (const path of REMOVED) {
        test(`${path} shows the designed 404 page`, async ({ page }) => {
            const response = await page.goto(path);
            expect(response?.status()).toBe(404);
            await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
            await expect(page.getByText('404')).toBeVisible();
            await expect(page.getByRole('link').filter({ hasText: /home|الرئيسية/i }).first()).toBeVisible();
        });
    }

    test('404 page is in the right language and direction', async ({ page }) => {
        await page.goto('/ar/projects');
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        await page.goto('/en/projects');
        await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    });

    test('/news and /news/<slug> redirect permanently to articles', async ({ request }) => {
        for (const [from, to] of [
            ['/ar/news', '/ar/articles'],
            ['/en/news/some-story', '/en/articles/some-story'],
        ]) {
            const response = await request.get(from, { maxRedirects: 0 });
            expect([301, 308]).toContain(response.status());
            expect(response.headers()['location']).toContain(to);
        }
    });

    test('no legacy script or style is shipped (GSAP, toast)', async ({ page }) => {
        const loaded: string[] = [];
        page.on('response', (r) => loaded.push(r.url()));
        await page.goto('/en');
        expect(loaded.filter((u) => /gsap|toastify/i.test(u))).toEqual([]);
    });
});
