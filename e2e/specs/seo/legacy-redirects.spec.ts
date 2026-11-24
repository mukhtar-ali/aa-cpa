import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

// T004b (research R4b): every legacy URL in docs/launch/legacy-redirects.csv answers with a permanent redirect (308/301)
// to its mapped path, and that path answers 200 (following any further hops). Run on staging and production:
//   WEB_BASE_URL=https://staging.aacpa.sa pnpm exec playwright test --project=web e2e/specs/seo/legacy-redirects.spec.ts
// The CSV has the columns from,to,type (the same file is imported into admin → Redirects).

const CSV = fileURLToPath(new URL('../../../docs/launch/legacy-redirects.csv', import.meta.url));

interface Row {
    from: string;
    to: string;
    type: string;
}

function parseCsv(text: string): Row[] {
    return text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .slice(1) // header
        .map((line) => {
            const [from, to, type = 'permanent'] = line.split(',').map((cell) => cell.trim());
            return { from, to, type };
        })
        .filter((row) => row.from && row.to);
}

const rows = parseCsv(readFileSync(CSV, 'utf8'));

test.describe('legacy URL redirects', () => {
    test('the map is not empty and has no loops or duplicates', () => {
        test.skip(rows.length === 0, 'docs/launch/legacy-redirects.csv is still empty (run tests/legacy/crawl.sh)');
        const froms = rows.map((r) => r.from.toLowerCase());
        expect(new Set(froms).size, 'duplicate "from" paths').toBe(froms.length);
        for (const row of rows) {
            expect(row.from.startsWith('/'), `${row.from} must start with /`).toBe(true);
            expect(row.to.toLowerCase(), `${row.from} redirects to itself`).not.toBe(row.from.toLowerCase());
            expect(froms.includes(row.to.toLowerCase()), `${row.from} → ${row.to} is a chain`).toBe(false);
        }
    });

    for (const row of rows) {
        test(`${row.from} → ${row.to}`, async ({ request, baseURL }) => {
            const first = await request.get(row.from, { maxRedirects: 0 });
            expect(first.status(), `${row.from} should redirect`).toBe(row.type === 'temporary' ? 307 : 308);

            const location = first.headers()['location'] ?? '';
            const target = new URL(location, baseURL).pathname;
            expect(target).toBe(row.to.startsWith('http') ? new URL(row.to).pathname : row.to);

            if (!row.to.startsWith('http')) {
                const final = await request.get(row.to);
                expect(final.status(), `${row.to} should answer 200`).toBe(200);
            }
        });
    }
});
