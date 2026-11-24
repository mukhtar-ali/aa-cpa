import { expect, test } from '@playwright/test';

// US2 / T024: Consent verification under Google Consent Mode v2 and PDPL compliance:
// 1. Fresh profile makes no requests to GTM, GA4 or Meta Pixel before choice.
// 2. Banner is presented; accepting analytics only loads GA/GTM and not Meta Pixel.
// 3. Footer link reopens preferences; withdrawal clears cookies and updates consent to denied.
// 4. Bumping the consent version re-prompts the banner even if previously consented.
//
// Runnable against a running app (e.g. http://localhost:3000).

const TRACKING_URL_PATTERNS = [
    /googletagmanager\.com/,
    /google-analytics\.com/,
    /connect\.facebook\.net/,
    /facebook\.com\/tr/,
];

test.describe('Consent & Privacy Tracking Gates', () => {
    test('fresh profile makes zero tracking requests before consent', async ({ page }) => {
        const trackingRequests: string[] = [];

        page.on('request', (req) => {
            const url = req.url();
            if (TRACKING_URL_PATTERNS.some((pattern) => pattern.test(url))) {
                trackingRequests.push(url);
            }
        });

        await page.goto('/ar');

        // Verify the non-modal consent banner is visible
        const banner = page.locator('aside[role="region"]');
        await expect(banner).toBeVisible();

        // Ensure no tracking requests were initiated
        expect(trackingRequests).toHaveLength(0);

        // Verify no tracking cookies exist
        const cookies = await page.context().cookies();
        const trackingCookies = cookies.filter(
            (c) => c.name.startsWith('_ga') || c.name.startsWith('_fbp') || c.name.startsWith('_gid'),
        );
        expect(trackingCookies).toHaveLength(0);
    });

    test('accepting analytics grants GA/GTM but keeps advertising pixels blocked', async ({ page }) => {
        const trackingRequests: string[] = [];

        page.on('request', (req) => {
            const url = req.url();
            if (TRACKING_URL_PATTERNS.some((pattern) => pattern.test(url))) {
                trackingRequests.push(url);
            }
        });

        await page.goto('/en');

        const banner = page.locator('aside[role="region"]');
        await expect(banner).toBeVisible();

        // Open Preferences modal
        const customizeBtn = banner.getByRole('button', { name: /preferences|تخصيص/i });
        await customizeBtn.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();

        // Check Analytics checkbox, leave Marketing unchecked
        const analyticsCheckbox = dialog.getByLabel(/analytics/i);
        if (!(await analyticsCheckbox.isChecked())) {
            await analyticsCheckbox.check();
        }

        const marketingCheckbox = dialog.getByLabel(/marketing/i);
        if (await marketingCheckbox.isChecked()) {
            await marketingCheckbox.uncheck();
        }

        // Save preferences
        const saveBtn = dialog.getByRole('button', { name: /save preferences|حفظ التفضيلات/i });
        await saveBtn.click();

        await expect(dialog).toBeHidden();
        await expect(banner).toBeHidden();

        // Verify aacpa_consent cookie is stored
        const cookies = await page.context().cookies();
        const consentCookie = cookies.find((c) => c.name === 'aacpa_consent');
        expect(consentCookie).toBeDefined();

        const parsed = JSON.parse(decodeURIComponent(consentCookie!.value));
        expect(parsed.c.analytics).toBe(true);
        expect(parsed.c.marketing).toBe(false);

        // Verify Meta pixel request did NOT fire
        const metaRequests = trackingRequests.filter(
            (url) => url.includes('connect.facebook.net') || url.includes('facebook.com/tr'),
        );
        expect(metaRequests).toHaveLength(0);
    });

    test('footer link reopens preferences, and withdrawal clears tracking', async ({ page }) => {
        // Pre-seed full consent
        await page.context().addCookies([
            {
                name: 'aacpa_consent',
                value: encodeURIComponent(
                    JSON.stringify({ v: '1.0', c: { analytics: true, marketing: true }, t: Date.now() }),
                ),
                domain: 'localhost',
                path: '/',
            },
            {
                name: '_ga',
                value: 'GA1.2.123456789.123456789',
                domain: 'localhost',
                path: '/',
            },
            {
                name: '_fbp',
                value: 'fb.1.123456789.123456789',
                domain: 'localhost',
                path: '/',
            },
        ]);

        await page.goto('/ar');

        // Banner should NOT be visible because consent is already recorded
        const banner = page.locator('aside[role="region"]');
        await expect(banner).toBeHidden();

        // Click footer "Cookie settings" / "إعدادات ملفات الارتباط" link
        const footerCookieLink = page.locator('footer a[href="#cookie-settings"]');
        await expect(footerCookieLink).toBeVisible();
        await footerCookieLink.click();

        // Dialog should open
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();

        // Choose "Reject all" / "رفض غير الأساسية"
        const rejectBtn = dialog.getByRole('button', { name: /رفض|reject/i });
        await rejectBtn.click();

        await expect(dialog).toBeHidden();

        // Cookie should now show false for both
        const cookies = await page.context().cookies();
        const consentCookie = cookies.find((c) => c.name === 'aacpa_consent');
        expect(consentCookie).toBeDefined();
        const parsed = JSON.parse(decodeURIComponent(consentCookie!.value));
        expect(parsed.c.analytics).toBe(false);
        expect(parsed.c.marketing).toBe(false);

        // Tracking cookies should be removed
        const gaCookie = cookies.find((c) => c.name === '_ga');
        const fbpCookie = cookies.find((c) => c.name === '_fbp');
        expect(gaCookie).toBeUndefined();
        expect(fbpCookie).toBeUndefined();
    });

    test('consent version bump re-shows the banner to returning visitors', async ({ page }) => {
        // Pre-seed an older version (0.9)
        await page.context().addCookies([
            {
                name: 'aacpa_consent',
                value: encodeURIComponent(
                    JSON.stringify({ v: '0.9', c: { analytics: true, marketing: true }, t: Date.now() }),
                ),
                domain: 'localhost',
                path: '/',
            },
        ]);

        await page.goto('/en');

        // The banner MUST be re-shown because version 0.9 does not match current version (1.0)
        const banner = page.locator('aside[role="region"]');
        await expect(banner).toBeVisible();
    });
});
