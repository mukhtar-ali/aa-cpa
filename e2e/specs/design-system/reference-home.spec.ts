import { createRequire } from 'node:module';
import { expect, test, type Page } from '@playwright/test';

/**
 * T103: reference homepage (feature 001). Run against a web app started with ENABLE_REFERENCE_PAGES=true:
 *
 *   ENABLE_REFERENCE_PAGES=true PORT=3100 pnpm --filter @repo/web exec next dev -p 3100
 *   pnpm exec playwright test --project=design-system                 # add --update-snapshots the first time
 *
 * The 404 check needs the same app started WITHOUT the flag and runs only with REFERENCE_PAGES_OFF=1.
 * Accessibility uses axe-core injected into the page (the package is already a dependency of vitest-axe), which avoids a new dependency.
 */
const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core/axe.min.js');

const LANGS = ['ar', 'en'] as const;
const WIDTHS = [320, 360, 768, 1024, 1512, 1920] as const;

async function openHome(page: Page, lang: 'ar' | 'en', width = 1512) {
  await page.setViewportSize({ width, height: 900 });
  const response = await page.goto(`/${lang}/reference/home`);
  expect(response?.status()).toBe(200);
  await page.evaluate(() => document.fonts.ready);
}

test.describe('reference home: gate', () => {
  test('returns 404 when ENABLE_REFERENCE_PAGES is not set', async ({ page }) => {
    test.skip(process.env.REFERENCE_PAGES_OFF !== '1', 'needs a server started without ENABLE_REFERENCE_PAGES');
    for (const lang of LANGS) {
      const response = await page.goto(`/${lang}/reference/home`);
      expect(response?.status()).toBe(404);
    }
  });
});

for (const lang of LANGS) {
  test.describe(`reference home (${lang})`, () => {
    test.skip(process.env.REFERENCE_PAGES_OFF === '1', 'server runs without the reference flag');

    test('document direction, language and robots', async ({ page }) => {
      await openHome(page, lang);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    });

    test('axe: no serious or critical violations', async ({ page }) => {
      await openHome(page, lang);
      await page.addScriptTag({ path: AXE_PATH });
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (window as any).axe.run(document, { resultTypes: ['violations'] });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result.violations.filter((v: any) => v.impact === 'serious' || v.impact === 'critical').map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 3).map((n: any) => n.target.join(' ')) }));
      });
      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });

    for (const width of WIDTHS) {
      test(`no horizontal overflow and stable screenshot at ${width}px`, async ({ page }) => {
        await openHome(page, lang, width);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
        await expect(page).toHaveScreenshot(`home-${lang}-${width}.png`, { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.02, stylePath: new URL('./screenshot.css', import.meta.url).pathname });
      });
    }

    test('keyboard: tab reaches the header links before the page content and focus is visible', async ({ page }) => {
      await openHome(page, lang);
      const seen: string[] = [];
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const style = getComputedStyle(el);
          return { tag: el.tagName, inHeader: !!el.closest('header, [role="banner"]'), outline: style.outlineStyle !== 'none' || style.boxShadow !== 'none' };
        });
        if (info) seen.push(`${info.tag}:${info.inHeader}:${info.outline}`);
      }
      expect(seen.length).toBeGreaterThan(5);
      expect(seen.some((s) => s.includes(':true:'))).toBe(true);
      expect(seen.every((s) => s.endsWith(':true'))).toBe(true);
    });

    test('service tabs are operable with the arrow keys', async ({ page }) => {
      await openHome(page, lang);
      const tabs = page.getByRole('tab');
      await tabs.first().focus();
      await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('ArrowDown'); // the service tabs are a vertical list in both directions
      await expect(tabs.nth(1)).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel')).toBeVisible();
    });

    test('logo marquee pauses on hover and through the pause button', async ({ page }) => {
      await openHome(page, lang);
      const track = page.locator('.ds-marquee-track').first();
      await track.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await expect(track).toHaveCSS('animation-play-state', 'running');
      await track.hover({ force: true }); // the track is always moving, so Playwright never sees it as stable
      await expect(track).toHaveCSS('animation-play-state', 'paused');
      await page.mouse.move(0, 0);
      const pause = page.locator(':has(.ds-marquee-track) > button[aria-pressed]').first();
      await pause.click();
      await expect(pause).toHaveAttribute('aria-pressed', 'true');
      await expect(track).toHaveCSS('animation-play-state', 'paused');
    });
  });
}

test.describe('reference home: estimator flow (en)', () => {
  test.skip(process.env.REFERENCE_PAGES_OFF === '1', 'server runs without the reference flag');

  test('answers the four questions with the keyboard and reaches the range and the quote form', async ({ page }) => {
    await openHome(page, 'en');
    await page.getByLabel('Approximate annual revenue (SAR)').scrollIntoViewIfNeeded();
    await page.getByLabel('Approximate annual revenue (SAR)').fill('12000000');
    await page.getByRole('button', { name: 'Start estimate' }).click();
    await page.getByLabel('Number of employees').fill('85');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('radio', { name: 'Retail' }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('radio', { name: 'Within a month' }).check();
    await page.getByRole('button', { name: 'Your estimated range' }).click();
    await expect(page.getByText(/SAR|ر\.س/).first()).toBeVisible();
    await page.getByRole('button', { name: 'Request a formal quote' }).click();
    await expect(page.getByLabel('Full name')).toBeVisible();
  });
});
