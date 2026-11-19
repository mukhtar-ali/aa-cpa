import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 6: Admin Leads & Contact Submissions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-CONT-01: Navigating to /leads renders Leads, PDPL Privacy & Outbox screen', async ({ page }) => {
    await page.goto('http://localhost:3002/leads');
    await expect(page.getByRole('heading', { name: /leads/i }).first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('TC-CONT-02: Navigating to /contact-submissions renders Contact Submissions screen', async ({ page }) => {
    await page.goto('http://localhost:3002/contact-submissions');
    await expect(page.getByRole('heading', { name: /contact submissions/i }).first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});
