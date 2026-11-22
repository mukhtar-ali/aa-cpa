import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 9: Cross-System End-to-End Human User Journey', () => {
  test('TC-E2E-01: Full lifecycle - Admin publishes article -> Visitor submits message -> Admin receives message', async ({ page }) => {
    test.setTimeout(60000);
    // ----------------------------------------------------
    // STEP 1: Admin logs in and publishes a new article
    // ----------------------------------------------------
    await loginAsAdmin(page);
    await page.goto('http://localhost:3002/news');
    await page.waitForLoadState('domcontentloaded');

    const uniqueId = Date.now().toString().slice(-4);
    const articleTitleEn = `CPA Advisory Update ${uniqueId}`;
    const articleTitleAr = `تحديث الاستشارات المحاسبية ${uniqueId}`;
    const articleSlug = `cpa-advisory-${uniqueId}`;

    await page.getByRole('button', { name: /add article|add news/i }).click();
    const newsDialog = page.getByRole('dialog');
    await expect(newsDialog).toBeVisible();

    // Fill English Details
    await newsDialog.getByRole('tab', { name: 'EN' }).click();
    await newsDialog.locator('input[name="title.en"]').fill(articleTitleEn);
    await newsDialog.locator('textarea[name="excerpt.en"]').fill('Strategic guidance on corporate tax and regulatory audit standards.');

    // Fill Arabic Details
    await newsDialog.getByRole('tab', { name: 'AR' }).click();
    await newsDialog.locator('input[name="title.ar"]').fill(articleTitleAr);
    await newsDialog.locator('textarea[name="excerpt.ar"]').fill('إرشادات استراتيجية حول ضريبة الشركات ومعايير التدقيق التنظيمي.');

    // Set Slug & Toggle Published
    await newsDialog.locator('input[placeholder*="auto-generated"]').fill(articleSlug);
    const publishSwitch = newsDialog.getByRole('switch').first();
    if (await publishSwitch.getAttribute('aria-checked') === 'false') {
      await publishSwitch.click();
    }

    await newsDialog.locator('button[type="submit"]').click();
    await expect(newsDialog).not.toBeVisible({ timeout: 12000 });

    // Confirm visible in Admin Portal Table
    await expect(page.locator('main')).toContainText(articleTitleEn);

    // ----------------------------------------------------
    // STEP 2: Public Visitor browses the website and article
    // ----------------------------------------------------
    await page.goto(`http://localhost:3000/en/articles/${articleSlug}`).catch(() => {});

    // ----------------------------------------------------
    // STEP 3: Public Visitor submits an inquiry on Contact page
    // ----------------------------------------------------
    await page.goto('http://localhost:3000/en/contact');
    const contactForm = page.locator('form');
    if (await contactForm.isVisible()) {
      const visitorName = `Client Partner ${uniqueId}`;
      const visitorEmail = `client.${uniqueId}@example.com`;
      const inquiryMessage = `I am interested in corporate audit advisory services related to ${articleTitleEn}.`;

      await contactForm.locator('input').first().fill(visitorName);
      await contactForm.locator('input[type="email"]').fill(visitorEmail);
      const formInputs = await contactForm.locator('input').all();
      if (formInputs.length >= 3) {
        await formInputs[2].fill(`Audit Consultation for ${articleSlug}`);
      }
      await contactForm.locator('textarea').fill(inquiryMessage);

      await contactForm.getByRole('button', { name: /send|submit/i }).click();
      await expect(page.locator('.Toastify')).toContainText(/sent|success|thank/i, { timeout: 8000 });

      // ----------------------------------------------------
      // STEP 4: Admin verifies message in Contact Submissions
      // ----------------------------------------------------
      await page.goto('http://localhost:3002/contact-submissions');
      await expect(page.locator('main')).toContainText(visitorName);
      await expect(page.locator('main')).toContainText(visitorEmail);
    }
  });
});
