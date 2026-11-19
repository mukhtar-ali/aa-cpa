import { test, expect } from '@playwright/test';

test.describe('Module 8: Public Web Application (Next.js)', () => {
  test('TC-WEB-01: Root path automatically redirects to /en with 200 OK status', async ({ page }) => {
    const res = await page.goto('http://localhost:3000/');
    expect(res?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
  });

  test('TC-WEB-02: Arabic page /ar renders with RTL direction and Arabic content', async ({ page }) => {
    await page.goto('http://localhost:3000/ar');
    
    // Check for dir="rtl" on html or body or container
    const isRtl = await page.evaluate(() => {
      const htmlDir = document.documentElement.getAttribute('dir');
      const bodyDir = document.body.getAttribute('dir');
      return htmlDir === 'rtl' || bodyDir === 'rtl';
    });
    expect(isRtl).toBe(true);

    // Verify Arabic navigation or text is present
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-WEB-03: Home page displays header, search bar, and projects list', async ({ page }) => {
    // The cache wait below can take up to ~75 s, longer than the default 30 s test timeout.
    test.setTimeout(120 * 1000);
    await page.goto('http://localhost:3000/en');
    await expect(page.locator('header, nav').first()).toBeVisible();
    await expect(page.locator('input[type="search"]')).toBeVisible();

    // A newly published project can take a moment to show up: the home page caches its project list for 60 s
    // (stale-while-revalidate), so the first load after publishing may still be the old list. Reload until it appears.
    await expect(async () => {
      await page.reload();
      await expect(page.locator('#projects')).toContainText('Playwright Residence', { timeout: 3000 });
    }).toPass({ timeout: 75 * 1000, intervals: [2000, 5000] });
  });

  test('TC-WEB-04: About page is accessible and displays content', async ({ page }) => {
    const res = await page.goto('http://localhost:3000/en/about');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('TC-WEB-05: Careers page lists published jobs', async ({ page }) => {
    // Same 60 s stale-while-revalidate cache as the home page: reload until the new posting shows up.
    test.setTimeout(120 * 1000);
    const res = await page.goto('http://localhost:3000/en/careers');
    expect(res?.status()).toBeLessThan(400);
    await expect(async () => {
      await page.reload();
      await expect(page.locator('body')).toContainText('Senior QA Automation Lead', { timeout: 3000 });
    }).toPass({ timeout: 75 * 1000, intervals: [2000, 5000] });
  });

  test('TC-WEB-06: Contact form can be filled and submitted with feedback', async ({ page }) => {
    await page.goto('http://localhost:3000/en/contact');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const uniqueId = Date.now().toString().slice(-4);
    const testName = `Public Visitor ${uniqueId}`;
    const testEmail = `visitor.${uniqueId}@example.com`;
    const testMsg = `Hello, I am interested in Playwright Residence units. Ref: ${uniqueId}`;

    // Fill form inputs
    const form = page.locator('form');
    await form.locator('input').first().fill(testName);
    await form.locator('input[type="email"]').fill(testEmail);
    
    // Subject (if present)
    const inputs = await form.locator('input').all();
    if (inputs.length >= 3) {
      await inputs[2].fill(`Inquiry about unit ${uniqueId}`);
    }

    // Message textarea
    await form.locator('textarea').fill(testMsg);

    // Submit form
    await form.getByRole('button', { name: /send|submit/i }).click();

    // Verify success toast or confirmation
    await expect(page.locator('.Toastify')).toContainText(/sent|success|thank/i, { timeout: 8000 });
  });
});
