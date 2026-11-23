import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Axe sweep over every public page in both languages (WCAG 2.1 A/AA). Needs the API (seeded) and the web app running.
const PAGES = ['', '/about', '/services', '/sectors', '/articles', '/careers', '/contact', '/privacy', '/terms', '/accessibility'];

for (const lang of ['ar', 'en'] as const) {
    for (const path of PAGES) {
        test(`${lang}${path || '/'} has no axe violations`, async ({ page }) => {
            await page.goto(`/${lang}${path}`);
            await page.waitForLoadState('networkidle');
            const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
            expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target.join(' ')}`)).toEqual([]);
        });
    }
}

test('the first link is the skip link and it lands on main', async ({ page }) => {
    await page.goto('/en');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
});
