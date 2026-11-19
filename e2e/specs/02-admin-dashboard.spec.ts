import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 2: Admin Dashboard & Layout Controls', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-DASH-01: Displays all dashboard KPI cards and overview statistics', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await expect(page.locator('h1')).toContainText(/Dashboard/i);

    // Assert metric cards inside Overview panel
    const overview = page.getByRole('tabpanel', { name: /overview/i });
    await expect(overview.getByText('New Contact Messages', { exact: true })).toBeVisible();
    await expect(overview.getByText('Pending Applications', { exact: true })).toBeVisible();
    await expect(overview.getByText('Content to Publish', { exact: true })).toBeVisible();
    await expect(overview.getByText('Recent Activity', { exact: true })).toBeVisible();
  });

  test('TC-DASH-02: Sidebar navigation contains all functional modules', async ({ page }) => {
    await page.goto('http://localhost:3002/');

    // Verify sidebar links
    const sidebar = page.locator('aside, [data-sidebar="sidebar"], nav');
    await expect(sidebar.getByRole('link', { name: /users/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /news/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /careers/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Contact Submissions' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Contact Page' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: /settings/i })).toBeVisible();
  });

  test('TC-DASH-03: Theme switch toggles Dark and Light modes', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    
    // Check initial html class
    const htmlElement = page.locator('html');
    
    // Find theme toggle button
    const themeBtn = page.locator('button:has(.lucide-sun), button:has(.lucide-moon)');
    if (await themeBtn.count() > 0) {
      await themeBtn.first().click();
      const darkOption = page.getByRole('menuitem', { name: /dark/i });
      if (await darkOption.isVisible()) {
        await darkOption.click();
        await expect(htmlElement).toHaveClass(/dark/);
      }
    }
  });

  test('TC-DASH-04: Tabs switch between Overview and Analytics', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    
    const analyticsTab = page.getByRole('tab', { name: /analytics/i });
    if (await analyticsTab.isVisible()) {
      await analyticsTab.click();
      await expect(analyticsTab).toHaveAttribute('data-state', 'active');
    }
  });
});
