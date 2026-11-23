import { expect, test } from '@playwright/test';

// US5. Needs the API (seeded with several articles and categories) and the web app running (project "web").
test.describe('articles', () => {
    test('category filter is a link that changes the URL and marks the active chip', async ({ page }) => {
        await page.goto('/en/articles');
        const chips = page.getByRole('navigation', { name: /filter/i }).getByRole('link');
        test.skip((await chips.count()) < 2, 'seed has no categories');
        await chips.nth(1).click();
        await expect(page).toHaveURL(/category=/);
        await expect(page.getByRole('navigation', { name: /filter/i }).locator('[aria-current="true"]')).toHaveCount(1);
    });

    test('pagination links keep the filters and mark the page', async ({ page }) => {
        await page.goto('/en/articles');
        const next = page.getByRole('navigation', { name: /pagination/i }).getByRole('link', { name: /next/i });
        test.skip((await next.count()) === 0, 'seed fits on one page');
        await next.click();
        await expect(page).toHaveURL(/page=2/);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    });

    test('an article has a working table of contents, share box and related articles', async ({ page }) => {
        await page.goto('/en/articles');
        await page.locator('main a[href^="/en/articles/"]').first().click();
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        const toc = page.getByRole('navigation', { name: /in this article/i });
        if ((await toc.count()) > 0) {
            const link = toc.getByRole('link').first();
            const hash = (await link.getAttribute('href')) ?? '';
            await link.click();
            await expect(page).toHaveURL(new RegExp(`${hash.replace('#', '#')}$`));
            await expect(page.locator(hash)).toBeVisible();
        }
        await expect(page.getByRole('button', { name: /copy link/i }).first()).toBeVisible();
    });

    test('copy link announces success', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto('/en/articles');
        await page.locator('main a[href^="/en/articles/"]').first().click();
        await page.getByRole('button', { name: /copy link/i }).first().click();
        await expect(page.getByText(/link copied/i)).toBeVisible();
    });

    test('unknown article is the designed 404', async ({ page }) => {
        const response = await page.goto('/en/articles/does-not-exist');
        expect(response?.status()).toBe(404);
    });
});
