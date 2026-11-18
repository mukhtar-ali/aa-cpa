import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 4: Admin Projects Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-PROJ-01: Navigating to /projects renders projects page and action buttons', async ({ page }) => {
    await page.goto('http://localhost:3002/projects');
    await expect(page.getByRole('heading', { name: /project/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add project/i })).toBeVisible();
  });

  test('TC-PROJ-02: Add Project dialog opens and exposes English and Arabic language tabs', async ({ page }) => {
    await page.goto('http://localhost:3002/projects');
    await page.getByRole('button', { name: /add project/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('tab', { name: 'EN' })).toBeVisible();
    await expect(dialog.getByRole('tab', { name: 'AR' })).toBeVisible();
  });

  test('TC-PROJ-03: Successfully creates a bilingual project with publishing enabled', async ({ page }) => {
    await page.goto('http://localhost:3002/projects');
    await page.getByRole('button', { name: /add project/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const uniqueSlug = `playwright-residence-${Date.now().toString().slice(-4)}`;

    // Fill English tab
    await dialog.getByRole('tab', { name: 'EN' }).click();
    await dialog.locator('input[name="title.en"]').fill('Playwright Residence');
    await dialog.locator('input[name="subtitle.en"]').fill('Luxury Automated Living');
    await dialog.locator('input[name="location.en"]').fill('Dubai Marina');
    await dialog.locator('textarea[name="description.en"]').fill('A premier residential tower tested automatically.');

    // Fill Arabic tab
    await dialog.getByRole('tab', { name: 'AR' }).click();
    await dialog.locator('input[name="title.ar"]').fill('مساكن بلاي رايت');
    await dialog.locator('input[name="subtitle.ar"]').fill('حياة عصرية فاخرة');
    await dialog.locator('input[name="location.ar"]').fill('دبي مارينا');
    await dialog.locator('textarea[name="description.ar"]').fill('برج سكني رائد تم اختباره بالكامل.');

    // Set Slug
    await dialog.locator('input[placeholder*="auto-generated"]').fill(uniqueSlug);

    // Toggle Published Switch
    const publishSwitch = dialog.getByRole('switch').first();
    if (await publishSwitch.getAttribute('aria-checked') === 'false') {
      await publishSwitch.click();
    }

    // Submit form
    const submitBtn = dialog.locator('button[type="submit"]');
    await submitBtn.click();

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 12000 });

    // Project should appear in table list
    await expect(page.getByRole('table')).toContainText('Playwright Residence');
  });
});
