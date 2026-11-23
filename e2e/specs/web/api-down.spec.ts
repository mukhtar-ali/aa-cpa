import { execSync } from 'node:child_process';
import { expect, test } from '@playwright/test';

// US6 resilience: cached pages keep rendering while the API is down; an uncached page shows the branded error with contact details.
// Needs the stack under your control: set E2E_STOP_API_CMD and E2E_START_API_CMD (for example `docker stop aa-api` / `docker start aa-api`).
const stop = process.env.E2E_STOP_API_CMD;
const start = process.env.E2E_START_API_CMD;

test.describe.serial('API down', () => {
    test.skip(!stop || !start, 'set E2E_STOP_API_CMD and E2E_START_API_CMD');
    test.afterAll(() => {
        if (start) execSync(start, { stdio: 'ignore' });
    });

    test('a warmed page still renders and an unseen page shows the designed error', async ({ page }) => {
        await page.goto('/en/about'); // warm the cache
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        execSync(stop!, { stdio: 'ignore' });

        await page.goto('/en/about');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        await page.goto('/en/sectors?cache-bust=1');
        await expect(page.getByRole('alert')).toBeVisible();
        await expect(page.getByRole('link', { name: /contact|try again|home/i }).first()).toBeVisible();
    });
});
