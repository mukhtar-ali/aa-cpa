import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 13: Admin Leads, PDPL Data Rights, Outbox & Estimator', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-LEAD-01: Navigating to /leads displays Leads list, CSV export button, PDPL tab, and Outbox tab', async ({ page }) => {
    await page.goto('http://localhost:3002/leads');
    await expect(page.getByRole('heading', { name: /leads, pdpl privacy & outbox/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible();

    // Switch to PDPL tab
    await page.getByRole('tab', { name: /pdpl data subject rights/i }).click();
    await expect(page.getByRole('button', { name: /export subject data/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /erase subject data/i })).toBeVisible();

    // Switch to Outbox tab
    await page.getByRole('tab', { name: /email & revalidation outbox/i }).click();
  });

  test('TC-EST-01: Navigating to /estimator displays Fee Estimator Configuration and approval dialog', async ({ page }) => {
    await page.goto('http://localhost:3002/estimator');
    await expect(page.getByRole('heading', { name: /fee estimator configuration/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save config/i })).toBeVisible();
  });
});
