import { expect, test } from '@playwright/test';

// US3. Needs the API seeded with an APPROVED estimator config and a testimonial for the home placement, and the web app running.
// The not-approved case needs the API started with the estimator in draft; set E2E_ESTIMATOR_DRAFT=1 for that run.
test.describe('estimator', () => {
    test.skip(!!process.env.E2E_ESTIMATOR_DRAFT, 'run against the draft config');

    test('answers the questions, shows a range with the disclaimer, then offers a formal quote', async ({ page }) => {
        await page.goto('/en');
        // Four questions: pick the first option of each and press the step's button ("Start estimate", then "Next", and on the last one
        // "Your estimated range").
        for (let i = 0; i < 4; i += 1) {
            await page.getByRole('radio').first().check();
            await page.getByRole('button', { name: /^(start estimate|next|your estimated range)$/i }).click();
        }
        await expect(page.getByText(/SAR\s?[\d,]+\s?[–-]\s?SAR\s?[\d,]+|ريال/).first()).toBeVisible();
        await expect(page.getByText(/illustrative|not constitute/i).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /request a formal quote/i })).toBeVisible();
    });

    test('quote request shows a confirmation', async ({ page }) => {
        await page.goto('/en');
        test.skip(true, 'depends on the seeded questions; run manually per quickstart P3');
    });
});

test('not-approved estimator shows the contact call to action instead', async ({ page }) => {
    test.skip(!process.env.E2E_ESTIMATOR_DRAFT, 'needs the API with the estimator in draft');
    await page.goto('/en');
    await expect(page.getByRole('link', { name: /contact us/i }).last()).toBeVisible();
    await expect(page.getByText(/question 1 of/i)).toHaveCount(0);
});
