import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 3: Admin Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-USER-01: Navigating to /users renders Users table and columns', async ({ page }) => {
    await page.goto('http://localhost:3002/users');
    await expect(page.getByRole('heading', { name: /^users$/i })).toBeVisible();

    // Verify table structure
    const table = page.locator('table');
    await expect(table).toBeVisible();
    await expect(table).toContainText(/Super Admin|info@mokhtarali.com/);
  });

  test('TC-USER-02: Search input filters the users table', async ({ page }) => {
    await page.goto('http://localhost:3002/users');
    const searchInput = page.locator('input[placeholder*="Filter"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('info@mokhtarali.com');
      await expect(page.locator('table')).toContainText('info@mokhtarali.com');

      // Negative filter
      await searchInput.fill('nonexistent-person-xyz');
      await expect(page.locator('table')).not.toContainText('info@mokhtarali.com');
    }
  });

  test('TC-USER-03: Opens Add User dialog and validates required fields', async ({ page }) => {
    await page.goto('http://localhost:3002/users');
    
    // Click Add User button
    const addUserBtn = page.getByRole('button', { name: /add user/i });
    await addUserBtn.click();

    // Check dialog visibility
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Add New User');

    // Submit empty to trigger validation
    const submitBtn = dialog.getByRole('button', { name: /save|add|submit/i });
    await submitBtn.click();

    // Check validation message
    await expect(dialog.locator('.text-destructive, [data-slot="form-message"]')).not.toHaveCount(0);
  });

  test('TC-USER-04: Successfully creates a new user and confirms addition', async ({ page }) => {
    await page.goto('http://localhost:3002/users');
    
    const uniqueId = Date.now().toString().slice(-4);
    const testEmail = `qa.tester.${uniqueId}@example.com`;
    const testName = `QA Tester ${uniqueId}`;

    await page.getByRole('button', { name: /add user/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.locator('input[name="fullName"]').fill(testName);
    await dialog.locator('input[name="email"]').fill(testEmail);

    const submitBtn = dialog.getByRole('button', { name: /save|add|submit/i });
    await submitBtn.click();

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // New user should appear in table
    await expect(page.locator('table')).toContainText(testEmail);
  });
});
