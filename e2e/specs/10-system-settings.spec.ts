import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('Module 10: System Settings Deep Testing (Bilingual English & Arabic Production Data)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-SET-01: General Info - update production contact & bilingual details (EN & AR)', async ({ page, request }) => {
    await page.goto('http://localhost:3002/settings');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /site settings/i })).toBeVisible();

    const testEmail = `corporate.invest@apexhorizon.com`;
    const testPhone = `+971 4 392 8888`;
    const testWhatsapp = `+971 50 882 7711`;
    const testMap = `https://maps.google.com/?q=25.1972,55.2744`;

    // Fill contact fields
    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="phone"]').fill(testPhone);
    await page.locator('input[name="whatsapp"]').fill(testWhatsapp);
    await page.locator('input[name="location"]').fill(testMap);

    // Switch to EN tab & fill production English details
    await page.getByRole('tab', { name: 'EN', exact: true }).click();
    await page.locator('input[name="siteName.en"]').fill('Apex Horizon Luxury Developments');
    await page.locator('input[name="tagline.en"]').fill('Architecting Tomorrow\'s Iconic Skylines');
    await page.locator('input[name="businessHours.en"]').fill('Mon – Fri: 08:00 AM – 06:00 PM');
    await page.locator('input[name="address.en"]').fill('Building 4, Downtown Business Bay, Dubai, UAE');
    await page.locator('textarea[name="footerDescription.en"]').fill(
      'Apex Horizon is a world-class real estate development firm crafting landmark residential and commercial destinations with architectural excellence.'
    );

    // Switch to AR tab & fill production Arabic details
    await page.getByRole('tab', { name: 'AR', exact: true }).click();
    await page.locator('input[name="siteName.ar"]').fill('أبكس هورايزون للتطوير العقاري الفاخر');
    await page.locator('input[name="tagline.ar"]').fill('نبني معالم الغد ونبتكر تجارب حياة استثنائية');
    await page.locator('input[name="businessHours.ar"]').fill('من الأحد إلى الخميس: ٨:٠٠ ص - ٦:٠٠ م');
    await page.locator('input[name="address.ar"]').fill('المبنى ٤، الخليج التجاري، دبي، الإمارات العربية المتحدة');
    await page.locator('textarea[name="footerDescription.ar"]').fill(
      'أبكس هورايزون هي شركة رائدة عالمياً في الاستثمار والتطوير العقاري، متخصصة في تشييد أرقى الأبراج السكنية والمشاريع الذكية المستدامة.'
    );

    // Save changes
    const saveButton = page.getByRole('button', { name: /save changes/i });
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    // Verify persistence via API
    const apiRes = await request.get('http://localhost:3001/api/common/website-info/web', {
      headers: { 'Accept-Language': 'en' }
    });
    expect(apiRes.ok()).toBeTruthy();
    const dataEn = await apiRes.json();
    expect(dataEn.email).toBe(testEmail);
    expect(dataEn.phone).toBe(testPhone);
    expect(dataEn.whatsapp).toBe(testWhatsapp);
    expect(dataEn.address).toBe('Building 4, Downtown Business Bay, Dubai, UAE');

    // Verify Arabic API response via Accept-Language: ar
    const apiResAr = await request.get('http://localhost:3001/api/common/website-info/web', {
      headers: { 'Accept-Language': 'ar' }
    });
    expect(apiResAr.ok()).toBeTruthy();
    const dataAr = await apiResAr.json();
    expect(dataAr.address).toBe('المبنى ٤، الخليج التجاري، دبي، الإمارات العربية المتحدة');
  });

  test('TC-SET-02: Social Media Settings - update all 4 corporate social profiles', async ({ page, request }) => {
    await page.goto('http://localhost:3002/settings/social');
    await page.waitForLoadState('domcontentloaded');

    const fbUrl = 'https://facebook.com/ApexHorizonDevelopments';
    const linkedinUrl = 'https://linkedin.com/company/apex-horizon-properties';
    const igUrl = 'https://instagram.com/apex.horizon';
    const ytUrl = 'https://youtube.com/@ApexHorizonLuxury';

    await page.locator('input[name="facebookUrl"]').fill(fbUrl);
    await page.locator('input[name="instagramUrl"]').fill(igUrl);
    await page.locator('input[name="linkedinUrl"]').fill(linkedinUrl);
    await page.locator('input[name="youtubeUrl"]').fill(ytUrl);

    const saveButton = page.getByRole('button', { name: /save changes/i });
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    // Reload UI to confirm persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[name="facebookUrl"]')).toHaveValue(fbUrl);
    await expect(page.locator('input[name="instagramUrl"]')).toHaveValue(igUrl);
    await expect(page.locator('input[name="linkedinUrl"]')).toHaveValue(linkedinUrl);
    await expect(page.locator('input[name="youtubeUrl"]')).toHaveValue(ytUrl);

    // Verify in API
    const apiRes = await request.get('http://localhost:3001/api/common/website-info/web');
    const apiData = await apiRes.json();
    expect(apiData.facebookUrl).toBe(fbUrl);
    expect(apiData.instagramUrl).toBe(igUrl);
    expect(apiData.linkedinUrl).toBe(linkedinUrl);
    expect(apiData.youtubeUrl).toBe(ytUrl);
  });

  test('TC-SET-03: Home page SEO tab - update bilingual metadata (EN & AR)', async ({ page, request }) => {
    await page.goto('http://localhost:3002/home');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('tab', { name: 'SEO', exact: true }).click();

    const enTitle = 'Apex Horizon | Luxury Waterfront Residences & Sky Towers';
    const enDesc = 'Explore premier luxury towers, penthouses, and bespoke waterfront residences developed by Apex Horizon.';
    const enKeywords = 'luxury real estate, sky towers, penthouses, Dubai developments';

    const arTitle = 'أبكس هورايزون | عقارات وأبراج سكنية فاخرة بإطلالات ساحرة';
    const arDesc = 'اكتشف نخبة المشاريع السكنية والأبراج الذكية الفاخرة وشقق البنتهاوس مع أبكس هورايزون.';
    const arKeywords = 'عقارات فاخرة, شقق دبي, أبراج سكنية, بنتهاوس';

    // English Tab
    await page.getByRole('tab', { name: 'EN', exact: true }).click();
    await page.locator('input[name="title.en"]').fill(enTitle);
    await page.locator('input[name="description.en"]').fill(enDesc);
    await page.locator('input[name="keywords.en"]').fill(enKeywords);

    // Arabic Tab
    await page.getByRole('tab', { name: 'AR', exact: true }).click();
    await page.locator('input[name="title.ar"]').fill(arTitle);
    await page.locator('input[name="description.ar"]').fill(arDesc);
    await page.locator('input[name="keywords.ar"]').fill(arKeywords);

    const saveButton = page.getByRole('button', { name: /save changes/i });
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    // Reload UI to confirm persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('tab', { name: 'SEO', exact: true }).click();
    await page.getByRole('tab', { name: 'EN', exact: true }).click();
    await expect(page.locator('input[name="title.en"]')).toHaveValue(enTitle);
    await page.getByRole('tab', { name: 'AR', exact: true }).click();
    await expect(page.locator('input[name="title.ar"]')).toHaveValue(arTitle);
  });

  test('TC-SET-04: SEO defaults and tracking - bilingual defaults, GA4, and GTM IDs', async ({ page, request }) => {
    await page.goto('http://localhost:3002/settings/seo');
    await page.waitForLoadState('domcontentloaded');

    const enTemplate = '%s | Apex Horizon Official';
    const enDesc = 'Global headquarters and prime luxury real estate developments.';
    const enKeywords = 'real estate, investment, prime residences';

    const arTemplate = '%s | أبكس هورايزون الرسمية';
    const arDesc = 'البوابة الرسمية لأرقى المشاريع العقارية والاستثمارات المعمارية.';
    const arKeywords = 'استثمار عقاري, أبراج فاخرة, دبي';

    const gaId = 'G-APEX776655';
    const gtmId = 'GTM-APEX889';

    // English Tab
    await page.getByRole('tab', { name: 'EN', exact: true }).click();
    await page.locator('input[name="metaTitleTemplate.en"]').fill(enTemplate);
    await page.locator('input[name="metaDescription.en"]').fill(enDesc);
    await page.locator('input[name="keywords.en"]').fill(enKeywords);

    // Arabic Tab
    await page.getByRole('tab', { name: 'AR', exact: true }).click();
    await page.locator('input[name="metaTitleTemplate.ar"]').fill(arTemplate);
    await page.locator('input[name="metaDescription.ar"]').fill(arDesc);
    await page.locator('input[name="keywords.ar"]').fill(arKeywords);

    let saveButton = page.getByRole('button', { name: /save changes/i });
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    // Tracking IDs live on their own page; saving it must keep the defaults saved above.
    await page.goto('http://localhost:3002/settings/seo-tracking');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[name="googleAnalyticsId"]').fill(gaId);
    await page.locator('input[name="googleTagManagerId"]').fill(gtmId);
    saveButton = page.getByRole('button', { name: /save changes/i });
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    // Verify in API
    const apiRes = await request.get('http://localhost:3001/api/common/seo-global/web');
    const apiData = await apiRes.json();
    expect(apiData.googleAnalyticsId).toBe(gaId);
    expect(apiData.googleTagManagerId).toBe(gtmId);
    expect(apiData.metaDescription).toBe(enDesc);
  });

  test('TC-SET-05: Email Settings - configure enterprise SMTP credentials & test harness', async ({ page }) => {
    await page.goto('http://localhost:3002/settings/email');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[name="smtpHost"]').fill('smtp.sendgrid.net');
    await page.locator('input[name="smtpPort"]').fill('587');
    await page.locator('input[name="smtpUser"]').fill('apikey');
    await page.locator('input[name="smtpFromEmail"]').fill('no-reply@apexhorizon.com');
    await page.locator('input[name="smtpFromName"]').fill('Apex Horizon Notifications');

    const saveButton = page.getByRole('button', { name: /save changes/i });
    await saveButton.click();
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    // Test harness availability
    await expect(page.getByText(/send a test email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send test/i })).toBeVisible();
  });
});
