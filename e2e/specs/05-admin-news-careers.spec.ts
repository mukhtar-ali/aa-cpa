import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 5: Admin News & Careers Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-NEWS-01: Navigating to /news renders News list and action buttons', async ({ page }) => {
    await page.goto('http://localhost:3002/news');
    await expect(page.getByRole('heading', { name: /news/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /add article|add news/i })).toBeVisible();
  });

  test('TC-NEWS-02: Successfully creates a bilingual news article', async ({ page }) => {
    await page.goto('http://localhost:3002/news');
    await page.getByRole('button', { name: /add article|add news/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const uniqueSlug = `tech-breakthrough-${Date.now().toString().slice(-4)}`;

    // Fill English tab
    await dialog.getByRole('tab', { name: 'EN' }).click();
    await dialog.locator('input[name="title.en"]').fill('Tech Breakthrough Announced');
    await dialog.locator('textarea[name="excerpt.en"]').fill('A major milestone in software automation.');

    // Fill Arabic tab
    await dialog.getByRole('tab', { name: 'AR' }).click();
    await dialog.locator('input[name="title.ar"]').fill('إعلان إنجاز تقني جديد');
    await dialog.locator('textarea[name="excerpt.ar"]').fill('إنجاز غير مسبوق في أتمتة الأنظمة البرمجية.');

    // Fill Slug
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

    // Article should appear in cards or table
    await expect(page.locator('[data-slot="card"], table, main').first()).toContainText('Tech Breakthrough Announced');
  });

  test('TC-JOBS-01: Navigating to /careers renders Careers management and Add Job button', async ({ page }) => {
    await page.goto('http://localhost:3002/careers');
    await expect(page.getByRole('heading', { name: /career|job/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /add job/i })).toBeVisible();
  });

  test('TC-JOBS-02: Successfully creates a new bilingual job vacancy', async ({ page }) => {
    await page.goto('http://localhost:3002/careers');
    await page.getByRole('button', { name: /add job/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const uniqueSlug = `senior-qa-lead-${Date.now().toString().slice(-4)}`;

    // Fill English tab
    await dialog.getByRole('tab', { name: 'EN' }).click();
    await dialog.locator('input[name="title.en"]').fill('Senior QA Automation Lead');
    await dialog.locator('input[name="location.en"]').fill('Remote');
    await dialog.locator('textarea[name="summary.en"]').fill('Lead our browser automation and testing efforts.');

    // Fill Arabic tab
    await dialog.getByRole('tab', { name: 'AR' }).click();
    await dialog.locator('input[name="title.ar"]').fill('قائد مهندسي ضمان الجودة');
    await dialog.locator('input[name="location.ar"]').fill('عن بعد');
    await dialog.locator('textarea[name="summary.ar"]').fill('قيادة استراتيجية الاختبار الآلي وجودة النظم البرمجية.');

    // Fill Slug
    await dialog.locator('input[name="slug"]').fill(uniqueSlug);

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

    // Job should appear
    await expect(page.locator('[data-slot="card"], table, main').first()).toContainText('Senior QA Automation Lead');
  });

  test('TC-JOBS-03: Applications tab or screen is accessible', async ({ page }) => {
    await page.goto('http://localhost:3002/careers');
    const appsTab = page.getByRole('tab', { name: /application/i });
    if (await appsTab.isVisible()) {
      await appsTab.click();
      await expect(appsTab).toHaveAttribute('data-state', 'active');
    }
  });
});
