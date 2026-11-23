import { expect, test } from '@playwright/test';

// US1: every public content page renders in both languages, the chrome links resolve, and switching language keeps the page.
// Needs the API (seeded) and the web app running; see playwright.config.ts (project "web").
const PAGES = ['', '/about', '/services', '/sectors', '/privacy', '/terms', '/accessibility', '/contact'];

for (const lang of ['ar', 'en'] as const) {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    test.describe(`/${lang}`, () => {
        for (const path of PAGES) {
            test(`${path || '/'} renders with chrome and one h1`, async ({ page }) => {
                const response = await page.goto(`/${lang}${path}`);
                expect(response?.status()).toBe(200);
                await expect(page.locator('html')).toHaveAttribute('dir', dir);
                await expect(page.locator('header')).toBeVisible();
                await expect(page.locator('footer')).toBeVisible();
                await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
            });
        }

        test('header and footer links resolve (no 404)', async ({ page, request }) => {
            await page.goto(`/${lang}`);
            const hrefs = await page.locator('header a[href^="/"], footer a[href^="/"]').evaluateAll((els) => [...new Set(els.map((a) => (a as HTMLAnchorElement).getAttribute('href') as string))]);
            expect(hrefs.length).toBeGreaterThan(3);
            for (const href of hrefs) {
                const res = await request.get(href, { maxRedirects: 5 });
                expect(res.status(), href).toBeLessThan(400);
            }
        });

        test('language switch keeps the page and remembers the choice', async ({ page, context }) => {
            const other = lang === 'ar' ? 'en' : 'ar';
            await page.goto(`/${lang}/services`);
            await page.locator(`a[href^="/${other}/services"]`).first().click();
            await expect(page).toHaveURL(new RegExp(`/${other}/services`));
            const cookie = (await context.cookies()).find((c) => c.name === 'NEXT_LOCALE');
            expect(cookie?.value).toBe(other);
            // A visit to the bare root now follows the remembered language.
            await page.goto('/');
            await expect(page).toHaveURL(new RegExp(`/${other}$`));
        });
    });
}

test('a translation fallback block is marked rtl inside an English page', async ({ page }) => {
    await page.goto('/en/articles');
    const fallback = page.locator('[lang="ar"][dir="rtl"]').first();
    // Only present when the seeded content has untranslated items; skip rather than fail on a fully translated seed.
    test.skip((await fallback.count()) === 0, 'seed has no Arabic-only content');
    await expect(fallback).toBeVisible();
});
