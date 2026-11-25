import { expect, test } from '@playwright/test';

// US1 / T019: SEO verification across public page templates:
// Unique title & description, absolute canonical, hreflang (ar, en, x-default),
// parseable JSON-LD of the correct @type, and robots rules.
// Requires web app running on baseURL (default http://localhost:3000 or configured baseURL).

const LOCALES = ['ar', 'en'] as const;

const STATIC_TEMPLATES = [
    { path: '', name: 'Home', expectedTypes: ['AccountingService', 'Organization'] },
    { path: '/about', name: 'About', expectedTypes: ['AccountingService', 'Organization', 'BreadcrumbList'] },
    { path: '/services', name: 'Services List', expectedTypes: ['BreadcrumbList'] },
    { path: '/sectors', name: 'Sectors', expectedTypes: ['BreadcrumbList'] },
    { path: '/articles', name: 'Articles List', expectedTypes: ['BreadcrumbList'] },
    { path: '/careers', name: 'Careers List', expectedTypes: ['BreadcrumbList'] },
    { path: '/contact', name: 'Contact', expectedTypes: ['AccountingService', 'Organization', 'BreadcrumbList'] },
    { path: '/privacy', name: 'Privacy Policy', expectedTypes: ['BreadcrumbList'] },
    { path: '/terms', name: 'Terms of Service', expectedTypes: ['BreadcrumbList'] },
    { path: '/accessibility', name: 'Accessibility', expectedTypes: ['BreadcrumbList'] },
];

for (const locale of LOCALES) {
    test.describe(`SEO checks for /${locale} templates`, () => {
        for (const template of STATIC_TEMPLATES) {
            test(`${template.name} has valid title, description, canonical, hreflang, and JSON-LD`, async ({ page }) => {
                const targetUrl = `/${locale}${template.path}`;
                const response = await page.goto(targetUrl);
                expect(response?.status()).toBe(200);

                // 1. Title
                const title = await page.title();
                expect(title.trim().length).toBeGreaterThan(3);

                // 2. Meta description
                const description = await page.locator('meta[name="description"]').getAttribute('content');
                expect(description).toBeTruthy();
                expect(description!.trim().length).toBeGreaterThan(10);

                // 3. Canonical URL
                const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
                expect(canonical).toBeTruthy();
                expect(canonical).toMatch(/^https?:\/\//);
                expect(canonical).toContain(`/${locale}${template.path}`);

                // 4. Hreflang alternates
                const arHreflang = await page.locator('link[rel="alternate"][hreflang="ar"]').getAttribute('href');
                const enHreflang = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href');
                const xDefault = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute('href');

                expect(arHreflang).toMatch(/^https?:\/\//);
                expect(enHreflang).toMatch(/^https?:\/\//);
                expect(xDefault).toMatch(/^https?:\/\//);
                expect(xDefault).toBe(arHreflang);

                // 5. OpenGraph basics
                const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
                const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
                const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
                const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');
                const ogAlternateLocale = await page.locator('meta[property="og:locale:alternate"]').getAttribute('content');

                expect(ogTitle).toBe(title);
                expect(ogDescription).toBeTruthy();
                expect(ogImage).toBeTruthy();
                expect(ogLocale).toBe(locale === 'ar' ? 'ar_SA' : 'en_US');
                expect(ogAlternateLocale).toBe(locale === 'ar' ? 'en_US' : 'ar_SA');

                // 6. Parseable JSON-LD with expected @type
                const ldJsonScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
                expect(ldJsonScripts.length).toBeGreaterThan(0);

                const foundTypes: string[] = [];
                for (const script of ldJsonScripts) {
                    const parsed = JSON.parse(script);
                    const items = Array.isArray(parsed) ? parsed : [parsed];
                    for (const item of items) {
                        if (Array.isArray(item['@type'])) {
                            foundTypes.push(...item['@type']);
                        } else if (item['@type']) {
                            foundTypes.push(item['@type']);
                        }
                    }
                }

                for (const expectedType of template.expectedTypes) {
                    expect(foundTypes, `Missing expected JSON-LD @type ${expectedType} on ${targetUrl}`).toContain(expectedType);
                }
            });
        }

        test('Detail templates (service, article, career) have specialized JSON-LD schemas', async ({ page }) => {
            // Check first service link if available
            await page.goto(`/${locale}/services`);
            const serviceLink = page.locator('main a[href*="/services/"]').first();
            if ((await serviceLink.count()) > 0) {
                const serviceHref = await serviceLink.getAttribute('href');
                if (serviceHref) {
                    await page.goto(serviceHref);
                    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
                    const types = scripts.flatMap((s) => {
                        const p = JSON.parse(s);
                        const items = Array.isArray(p) ? p : [p];
                        return items.flatMap((i) => Array.isArray(i['@type']) ? i['@type'] : [i['@type']]);
                    });
                    expect(types).toContain('Service');
                    expect(types).toContain('BreadcrumbList');
                }
            }

            // Check first article link if available
            await page.goto(`/${locale}/articles`);
            const articleLink = page.locator('main a[href*="/articles/"]').first();
            if ((await articleLink.count()) > 0) {
                const articleHref = await articleLink.getAttribute('href');
                if (articleHref) {
                    await page.goto(articleHref);
                    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
                    const types = scripts.flatMap((s) => {
                        const p = JSON.parse(s);
                        const items = Array.isArray(p) ? p : [p];
                        return items.flatMap((i) => Array.isArray(i['@type']) ? i['@type'] : [i['@type']]);
                    });
                    expect(types).toContain('Article');
                    expect(types).toContain('BreadcrumbList');
                }
            }

            // Check first job link if available
            await page.goto(`/${locale}/careers`);
            const jobLink = page.locator('main a[href*="/careers/"]').first();
            if ((await jobLink.count()) > 0) {
                const jobHref = await jobLink.getAttribute('href');
                if (jobHref) {
                    await page.goto(jobHref);
                    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
                    const types = scripts.flatMap((s) => {
                        const p = JSON.parse(s);
                        const items = Array.isArray(p) ? p : [p];
                        return items.flatMap((i) => Array.isArray(i['@type']) ? i['@type'] : [i['@type']]);
                    });
                    expect(types).toContain('JobPosting');
                    expect(types).toContain('BreadcrumbList');
                }
            }
        });
    });
}

test.describe('Robots and Sitemap endpoints', () => {
    test('/robots.txt is reachable and contains sitemap directive', async ({ request, baseURL }) => {
        const response = await request.get('/robots.txt');
        expect(response.status()).toBe(200);
        const text = await response.text();
        expect(text).toMatch(/user-agent: \*/i);
        expect(text).toContain('Sitemap:');
        expect(text).toContain('/sitemap.xml');
    });

    test('/sitemap.xml is reachable and returns valid XML with alternate links', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        expect(response.status()).toBe(200);
        const text = await response.text();
        expect(text).toContain('<urlset');
        expect(text).toContain('<loc>');
        expect(text).toContain('xhtml:link');
        expect(text).toContain('hreflang="ar"');
        expect(text).toContain('hreflang="en"');
        expect(text).toContain('hreflang="x-default"');
    });
});
