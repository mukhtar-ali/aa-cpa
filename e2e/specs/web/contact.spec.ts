import { expect, test } from '@playwright/test';

// US2. Needs the API (seeded) and the web app running (project "web").
// Not covered: no-JS submit. The design-system form is a client component without a native `action`, so it needs JavaScript; recorded in tasks.md (T026).
const url = (lang: 'ar' | 'en') => `/${lang}/contact`;

test.describe('contact form', () => {
    test('valid submission shows the success message', async ({ page }) => {
        await page.goto(url('en'));
        await page.waitForTimeout(3500); // the API's guard rejects forms submitted in under 3 seconds
        await page.getByLabel(/full name/i).fill('Omar Al-Salem');
        await page.getByLabel(/mobile/i).fill('0555346560');
        await page.getByLabel(/^email/i).fill('omar@example.com');
        await page.getByLabel(/your message/i).fill('We need an external audit for next year.');
        await page.getByRole('checkbox').check();
        await page.getByRole('button', { name: /send/i }).click();
        await expect(page.getByRole('status')).toBeVisible();
    });

    test('invalid input shows an error summary that takes focus', async ({ page }) => {
        await page.goto(url('en'));
        await page.getByRole('button', { name: /send/i }).click();
        const summary = page.getByRole('alert').first();
        await expect(summary).toBeVisible();
        await expect(summary).toBeFocused();
    });

    test('double click sends one request', async ({ page }) => {
        let calls = 0;
        await page.route('**/en/contact', (route) => {
            if (route.request().method() === 'POST') calls += 1;
            return route.continue();
        });
        await page.goto(url('en'));
        await page.waitForTimeout(3500);
        await page.getByLabel(/full name/i).fill('Omar');
        await page.getByLabel(/mobile/i).fill('0555346560');
        await page.getByLabel(/^email/i).fill('omar@example.com');
        await page.getByLabel(/your message/i).fill('A long enough message here.');
        await page.getByRole('checkbox').check();
        await page.getByRole('button', { name: /send/i }).dblclick();
        await expect(page.getByRole('status')).toBeVisible();
        expect(calls).toBe(1);
    });

    test('consent links to the privacy policy in the same language', async ({ page }) => {
        await page.goto(url('ar'));
        await expect(page.locator('a[href="/ar/privacy"]').first()).toBeVisible();
    });

    test('keyboard only: tab order reaches the submit button', async ({ page }) => {
        await page.goto(url('en'));
        await page.getByLabel(/full name/i).focus();
        for (let i = 0; i < 8; i += 1) await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: /send/i })).toBeFocused();
    });

    test('?service= preselects the service', async ({ page, request }) => {
        const services = (await (await request.get('/api/services?lang=en')).json()) as { slug: string; title: string }[];
        test.skip(services.length === 0, 'no seeded services');
        await page.goto(`${url('en')}?service=${services[0].slug}`);
        await expect(page.getByLabel(/^service/i)).toHaveValue(/.+/);
    });
});
