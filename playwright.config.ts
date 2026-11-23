import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  timeout: 45 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: false,
  workers: 1, // Single worker to ensure sequential database state and prevent race conditions
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /(design-system|web)\//,
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use the user's installed Google Chrome
      },
    },
    {
      // Feature 003 public site journeys (needs the API on 3001 and the web app on 3000, seeded).
      name: 'web',
      testMatch: /web\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL: process.env.WEB_BASE_URL ?? 'http://localhost:3000',
      },
    },
    {
      // Feature 001 reference pages (needs the web app started with ENABLE_REFERENCE_PAGES=true on port 3100).
      name: 'design-system',
      testMatch: /design-system\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL: process.env.DS_BASE_URL ?? 'http://localhost:3100',
      },
    },
  ],
});
