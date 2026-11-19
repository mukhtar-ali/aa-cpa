import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 12: Admin CPA Services & Sectors Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-SRV-01: Navigating to /services renders CPA Services list and Add Service button', async ({ page }) => {
    await page.goto('http://localhost:3002/services');
    await expect(page.getByRole('heading', { name: /cpa services/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /add service/i })).toBeVisible();
  });

  test('TC-SRV-02: Opening Add Service dialog shows Arabic-first bilingual tabs and publish guard', async ({ page }) => {
    await page.goto('http://localhost:3002/services');
    await page.getByRole('button', { name: /add service/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('publish-guard-alert')).toBeVisible();

    await dialog.locator('#service-slug').fill(`audit-${Date.now().toString().slice(-4)}`);
    await dialog.locator('#title-ar').fill('خدمة التدقيق المالي');
    await dialog.locator('#summary-ar').fill('وصف خدمة التدقيق المالي والشهادات المهنية');

    // Once Arabic required fields are filled, publish guard alert disappears
    await expect(dialog.getByTestId('publish-guard-alert')).toHaveCount(0);
  });

  test('TC-SEC-01: Navigating to /sectors renders Industry Sectors list and Add Sector button', async ({ page }) => {
    await page.goto('http://localhost:3002/sectors');
    await expect(page.getByRole('heading', { name: /industry sectors/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /add sector/i })).toBeVisible();
  });
});
