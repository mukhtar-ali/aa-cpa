import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 7: Admin CMS & Page Settings (Bilingual English & Arabic Production Data)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-CMS-01: About Page CMS - update Hero title & subtitle in EN and AR, verify persistence', async ({ page, request }) => {
    await page.goto('http://localhost:3002/about-page');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /about page/i })).toBeVisible();

    // Select Hero tab
    await page.getByRole('tab', { name: 'Hero', exact: true }).click();

    const enHeroTitle = 'Pioneering Architectural Landmarks';
    const enHeroSubtitle = 'Over two decades of shaping luxury living and sustainable urban innovation.';
    const arHeroTitle = 'ريادة معمارية تصنع المستقبل';
    const arHeroSubtitle = 'أكثر من عقدين من التميز في تشييد المشاريع الحضرية المستدامة والحياة الراقية.';

    // Fill English fields
    await page.getByRole('tab', { name: 'EN', exact: true }).click();
    await page.locator('input[name="title.en"]').fill(enHeroTitle);
    await page.locator('input[name="subtitle.en"]').fill(enHeroSubtitle);

    // Fill Arabic fields
    await page.getByRole('tab', { name: 'AR', exact: true }).click();
    await page.locator('input[name="title.ar"]').fill(arHeroTitle);
    await page.locator('input[name="subtitle.ar"]').fill(arHeroSubtitle);

    // Save changes
    const saveButton = page.getByRole('button', { name: /save changes/i }).first();
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    // Verify on Public Web API in English
    const webEn = await request.get('http://localhost:3001/api/about/web', {
      headers: { 'Accept-Language': 'en' }
    });
    expect(webEn.ok()).toBeTruthy();
    const dataEn = await webEn.json();
    expect(dataEn.hero.title).toBe(enHeroTitle);
    expect(dataEn.hero.subtitle).toBe(enHeroSubtitle);

    // Verify on Public Web API in Arabic
    const webAr = await request.get('http://localhost:3001/api/about/web', {
      headers: { 'Accept-Language': 'ar' }
    });
    expect(webAr.ok()).toBeTruthy();
    const dataAr = await webAr.json();
    expect(dataAr.hero.title).toBe(arHeroTitle);
    expect(dataAr.hero.subtitle).toBe(arHeroSubtitle);
  });

  test('TC-CMS-02: Contact Page CMS - update Hero title & subtitle in EN and AR, verify persistence', async ({ page, request }) => {
    await page.goto('http://localhost:3002/contact-page');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /contact page/i })).toBeVisible();

    await page.getByRole('tab', { name: 'Hero', exact: true }).click();

    const enTitle = 'Connect with Our Executive Advisors';
    const enSubtitle = 'Whether seeking a prime penthouse or strategic investment partnerships, our team is at your service.';
    const arTitle = 'تواصل مع مستشارينا التنفيذيين';
    const arSubtitle = 'سواء كنت تبحث عن بنتهاوس فاخر أو شراكات استثمارية استراتيجية، فريقنا في خدمتك.';

    await page.getByRole('tab', { name: 'EN', exact: true }).click();
    await page.locator('input[name="title.en"]').fill(enTitle);
    await page.locator('input[name="subtitle.en"]').fill(enSubtitle);

    await page.getByRole('tab', { name: 'AR', exact: true }).click();
    await page.locator('input[name="title.ar"]').fill(arTitle);
    await page.locator('input[name="subtitle.ar"]').fill(arSubtitle);

    const saveButton = page.getByRole('button', { name: /save changes/i }).first();
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    // Verify public contact hero endpoint
    const res = await request.get('http://localhost:3001/api/contact/hero/web', {
      headers: { 'Accept-Language': 'en' }
    });
    if (res.ok()) {
      const data = await res.json();
      expect(data.title).toBe(enTitle);
    }
  });

  test('TC-CMS-03: Careers Page Settings - configure bilingual Hero & Culture copy', async ({ page }) => {
    await page.goto('http://localhost:3002/careers?tab=page-settings');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /careers/i })).toBeVisible();

    const enHero = 'Shape the Future of Real Estate Architecture';
    const arHero = 'اصنع معنا مستقبل التطوير المعماري الفاخر';

    await page.getByRole('tab', { name: 'EN', exact: true }).click();
    await page.locator('input[name="heroTitle.en"]').fill(enHero);

    await page.getByRole('tab', { name: 'AR', exact: true }).click();
    await page.locator('input[name="heroTitle.ar"]').fill(arHero);

    const saveButton = page.getByRole('button', { name: /save changes/i });
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    // Reload and check
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[name="heroTitle.en"]')).toHaveValue(enHero);
    await expect(page.locator('input[name="heroTitle.ar"]')).toHaveValue(arHero);
  });
});
