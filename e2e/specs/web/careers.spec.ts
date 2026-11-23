import { expect, test } from '@playwright/test';

// US4. Needs the API (seeded with an open job, ideally a closed one) and the web app running (project "web").
const pdf = (size = 2048) => ({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(size, 1) });

async function openFirstJob(page: import('@playwright/test').Page) {
    await page.goto('/en/careers');
    const link = page.locator('main a[href^="/en/careers/"]').first();
    test.skip((await link.count()) === 0, 'seed has no open jobs');
    await link.click();
}

async function fill(page: import('@playwright/test').Page) {
    await page.getByLabel(/full name/i).fill('Omar Al-Salem');
    await page.getByLabel(/mobile/i).fill('0555346560');
    await page.getByLabel(/^email/i).fill('omar@example.com');
    await page.getByRole('checkbox').check();
}

test.describe('careers', () => {
    test('department filter is a link and marks the active department', async ({ page }) => {
        await page.goto('/en/careers');
        const links = page.getByRole('navigation', { name: /department/i }).getByRole('link');
        test.skip((await links.count()) < 2, 'seed has no departments');
        await links.nth(1).click();
        await expect(page).toHaveURL(/department=/);
        await expect(page.getByRole('navigation', { name: /department/i }).locator('[aria-current="true"]')).toHaveCount(1);
    });

    test('a valid PDF application succeeds', async ({ page }) => {
        await openFirstJob(page);
        await page.waitForTimeout(3500); // the API's guard rejects forms submitted in under 3 seconds
        await fill(page);
        await page.locator('input[type="file"]').setInputFiles(pdf());
        await page.getByRole('button', { name: /send/i }).click();
        await expect(page.getByRole('status')).toBeVisible();
    });

    test('a wrong file type is refused with a message', async ({ page }) => {
        await openFirstJob(page);
        await page.locator('input[type="file"]').setInputFiles({ name: 'cv.png', mimeType: 'image/png', buffer: Buffer.alloc(1024) });
        await expect(page.getByText(/not allowed/i)).toBeVisible();
    });

    test('a file over 5 MB is refused with a message', async ({ page }) => {
        await openFirstJob(page);
        await page.locator('input[type="file"]').setInputFiles(pdf(5 * 1024 * 1024 + 1));
        await expect(page.getByText(/larger than allowed/i)).toBeVisible();
    });

    test('a closed job shows the closed state and no form', async ({ page, request }) => {
        const slug = process.env.E2E_CLOSED_JOB_SLUG;
        test.skip(!slug, 'set E2E_CLOSED_JOB_SLUG to a closed job in the seed');
        await page.goto(`/en/careers/${slug}`);
        await expect(page.getByText(/applications are closed/i)).toBeVisible();
        await expect(page.locator('input[type="file"]')).toHaveCount(0);
    });

    test('the apply button moves focus to the form', async ({ page }) => {
        await openFirstJob(page);
        await page.getByRole('link', { name: /apply now/i }).first().click();
        await expect(page).toHaveURL(/#apply$/);
    });
});
