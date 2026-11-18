import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 9: Cross-System End-to-End Human User Journey', () => {
  test('TC-E2E-01: Full lifecycle - Admin publishes project -> Public visitor sees it -> Visitor submits message -> Admin receives message', async ({ page }) => {
    test.setTimeout(60000);
    // ----------------------------------------------------
    // STEP 1: Admin logs in and publishes a new project
    // ----------------------------------------------------
    await loginAsAdmin(page);
    await page.goto('http://localhost:3002/projects');
    await page.waitForLoadState('domcontentloaded');

    const uniqueId = Date.now().toString().slice(-4);
    const projectTitleEn = `Grand Horizon Tower ${uniqueId}`;
    const projectTitleAr = `برج جراند هورايزون ${uniqueId}`;
    const projectSlug = `grand-horizon-${uniqueId}`;

    await page.getByRole('button', { name: /add project/i }).click();
    const projectDialog = page.getByRole('dialog');
    await expect(projectDialog).toBeVisible();

    // Fill English Details
    await projectDialog.getByRole('tab', { name: 'EN' }).click();
    await projectDialog.locator('input[name="title.en"]').fill(projectTitleEn);
    await projectDialog.locator('input[name="subtitle.en"]').fill('Luxury Sky Living');
    await projectDialog.locator('input[name="location.en"]').fill('Downtown District');
    await projectDialog.locator('textarea[name="description.en"]').fill('A world-class architectural marvel with panoramic views.');

    // Fill Arabic Details
    await projectDialog.getByRole('tab', { name: 'AR' }).click();
    await projectDialog.locator('input[name="title.ar"]').fill(projectTitleAr);
    await projectDialog.locator('input[name="subtitle.ar"]').fill('معيشة راقية في قلب المدينة');
    await projectDialog.locator('input[name="location.ar"]').fill('وسط المدينة');
    await projectDialog.locator('textarea[name="description.ar"]').fill('تحفة معمارية عالمية المستوى بإطلالات بانورامية.');

    // Set Slug & Toggle Published
    await projectDialog.locator('input[placeholder*="auto-generated"]').fill(projectSlug);
    const publishSwitch = projectDialog.getByRole('switch').first();
    if (await publishSwitch.getAttribute('aria-checked') === 'false') {
      await publishSwitch.click();
    }

    await projectDialog.locator('button[type="submit"]').click();
    await expect(projectDialog).not.toBeVisible({ timeout: 12000 });

    // Confirm visible in Admin Portal Table
    await expect(page.getByRole('table')).toContainText(projectTitleEn);

    // ----------------------------------------------------
    // STEP 2: Public Visitor browses the website and project
    // ----------------------------------------------------
    // Navigate directly to the project detail page
    await page.goto(`http://localhost:3000/en/${projectSlug}`);
    await expect(page.locator('h1')).toContainText(projectTitleEn);

    // Visitor switches to Arabic and sees Arabic title
    await page.goto(`http://localhost:3000/ar/${projectSlug}`);
    await expect(page.locator('h1')).toContainText(projectTitleAr);

    // ----------------------------------------------------
    // STEP 3: Public Visitor submits an inquiry on Contact page
    // ----------------------------------------------------
    await page.goto('http://localhost:3000/en/contact');
    const contactForm = page.locator('form');
    await expect(contactForm).toBeVisible();

    const visitorName = `VIP Buyer ${uniqueId}`;
    const visitorEmail = `vip.buyer.${uniqueId}@example.com`;
    const inquiryMessage = `I am interested in purchasing a penthouse at ${projectTitleEn}. Please call me immediately.`;

    await contactForm.locator('input').first().fill(visitorName);
    await contactForm.locator('input[type="email"]').fill(visitorEmail);
    const formInputs = await contactForm.locator('input').all();
    if (formInputs.length >= 3) {
      await formInputs[2].fill(`Penthouse Inquiry for ${projectSlug}`);
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
  });
});
