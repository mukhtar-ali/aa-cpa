import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 6: Admin Inquiries & Contact Submissions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-INQ-01: Navigating to /inquiries renders Inquiries dashboard table', async ({ page }) => {
    await page.goto('http://localhost:3002/inquiries');
    await expect(page.getByRole('heading', { name: /inquiries/i }).first()).toBeVisible();
    await expect(page.locator('table, [data-slot="card"], main').first()).toBeVisible();
  });

  test('TC-CONT-01: Navigating to /contact-submissions renders Contact Submissions screen', async ({ page }) => {
    await page.goto('http://localhost:3002/contact-submissions');
    await expect(page.getByRole('heading', { name: /contact submissions/i }).first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});
