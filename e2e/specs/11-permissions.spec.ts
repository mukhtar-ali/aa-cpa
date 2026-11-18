import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

const LIMITED_EMAIL = process.env.E2E_LIMITED_EMAIL;
const LIMITED_PASSWORD = process.env.E2E_LIMITED_PASSWORD;

test.describe('Module 11: Role & Permission Gating (Sidebar & Route Guards)', () => {
  test.skip(
    !LIMITED_EMAIL || !LIMITED_PASSWORD,
    'Skipping limited-permission spec: E2E_LIMITED_EMAIL and E2E_LIMITED_PASSWORD env vars are not set.'
  );

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/sign-in');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
    await loginAsAdmin(page, LIMITED_EMAIL!, LIMITED_PASSWORD!);
  });

  test('TC-PERM-01: Limited-permission user does not see forbidden sidebar items or dead help-center link', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('aside, [data-sidebar="sidebar"], nav').first();
    await expect(sidebar.getByRole('link', { name: /dashboard/i })).toBeVisible();

    // Forbidden sidebar links must be hidden
    await expect(sidebar.getByRole('link', { name: /^users$/i })).toHaveCount(0);
    await expect(sidebar.getByRole('link', { name: /inquiries/i })).toHaveCount(0);
    await expect(sidebar.getByRole('link', { name: 'Contact Submissions' })).toHaveCount(0);
    await expect(sidebar.getByRole('button', { name: /system settings/i })).toHaveCount(0);

    // Dead /help-center link must not exist
    await expect(sidebar.getByRole('link', { name: /help center/i })).toHaveCount(0);
  });

  test('TC-PERM-02: Limited-permission user is redirected to /403 when opening forbidden routes directly', async ({ page }) => {
    const forbiddenRoutes = [
      '/inquiries',
      '/users',
      '/contact-submissions',
      '/settings',
      '/home',
      '/about-page',
      '/contact-page',
      '/monitoring',
    ];

    for (const route of forbiddenRoutes) {
      await page.goto(`http://localhost:3002${route}`);
      await expect(page).toHaveURL(/\/403/, { timeout: 8000 });
      await expect(page.getByRole('heading', { name: '403' })).toBeVisible();
      await expect(page.getByText(/access forbidden/i)).toBeVisible();
    }
  });
});
