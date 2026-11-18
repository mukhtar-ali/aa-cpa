import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../fixtures/test-helpers';

test.describe('Module 1: Authentication & Access Control', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and local storage to start clean
    await page.goto('http://localhost:3002/sign-in');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
  });

  test('TC-AUTH-01: Displays login form with required fields', async ({ page }) => {
    await page.goto('http://localhost:3002/sign-in');
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('TC-AUTH-02: Rejects empty form submission with validation errors', async ({ page }) => {
    await page.goto('http://localhost:3002/sign-in');
    const submitBtn = page.getByRole('button', { name: /sign in/i });
    await submitBtn.click();
    
    // Check validation messages or that URL stays on sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('TC-AUTH-03: Rejects invalid credentials with error feedback', async ({ page }) => {
    await page.goto('http://localhost:3002/sign-in');
    await page.locator('input[type="email"]').fill('nonexistent@example.com');
    await page.locator('input[type="password"]').fill('WrongPassword@123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify error notification or inline alert
    const errorAlert = page.locator('.bg-destructive\\/10, [data-sonner-toast]');
    await expect(errorAlert.first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('TC-AUTH-04: Successfully authenticates with valid credentials and redirects to Dashboard', async ({ page }) => {
    await page.goto('http://localhost:3002/sign-in');
    await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify redirected away from sign-in
    await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/Super Admin|Dashboard|Overview|Admin/i);
  });

  test('TC-AUTH-05: Route Guard redirects unauthenticated visitor trying to access protected routes', async ({ page }) => {
    await page.goto('http://localhost:3002/users');
    // Should be redirected to sign-in
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 8000 });

    await page.goto('http://localhost:3002/projects');
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 8000 });
  });

  test('TC-AUTH-06: Forgot password page renders and has email input', async ({ page }) => {
    await page.goto('http://localhost:3002/forgot-password');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /continue|send|submit/i })).toBeVisible();
  });
});
