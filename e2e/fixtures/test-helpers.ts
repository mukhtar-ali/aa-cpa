import { Page, expect } from '@playwright/test';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var ${name}. Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (the seeded super-admin) before running e2e.`);
  }
  return value;
}

// Credentials come from the environment so no secrets are committed.
export const TEST_CREDENTIALS = {
  get email() {
    return requireEnv('E2E_ADMIN_EMAIL');
  },
  get password() {
    return requireEnv('E2E_ADMIN_PASSWORD');
  },
};

export async function loginAsAdmin(page: Page, email = TEST_CREDENTIALS.email, password = TEST_CREDENTIALS.password) {
  await page.goto('http://localhost:3002/sign-in');
  await page.waitForLoadState('domcontentloaded');

  // If already logged in, we will be redirected to dashboard
  if (page.url().includes('/sign-in')) {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.getByRole('button', { name: /sign in/i });

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitBtn.click();

    // Wait for redirect to dashboard
    await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 10000 });
  }
}
