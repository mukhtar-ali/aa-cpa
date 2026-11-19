import { test, expect } from '@playwright/test';

test.describe('E2E Infrastructure Smoke Tests', () => {
  test('Admin Portal is accessible and renders login or dashboard', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await expect(page).toHaveTitle(/Admin/i);
    console.log('Admin Portal URL:', page.url());
  });

  test('Public Web Application is accessible and renders without 500 error', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/');
    expect(response?.status()).toBeLessThan(400);
    // Should have redirected to /en or rendered home page
    expect(page.url()).toContain('/en');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('NestJS API Swagger is accessible', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/api/swagger');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('Nest Next Starter API');
  });
});
