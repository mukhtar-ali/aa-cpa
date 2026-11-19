import { mergeRollupStats, summarizeValues } from './rollup-stats';

describe('summarizeValues', () => {
    it('computes count, min, max and the percentiles of one batch', () => {
        const stats = summarizeValues([40, 10, 30, 20, 50, 60, 70, 80, 90, 100]);
        expect(stats).toEqual({ count: 10, min: 10, max: 100, p50: 60, p75: 80, p90: 100 });
    });

    it('handles a single value', () => {
        expect(summarizeValues([7])).toEqual({ count: 1, min: 7, max: 7, p50: 7, p75: 7, p90: 7 });
    });

    it('does not mutate its input', () => {
        const values = [3, 1, 2];
        summarizeValues(values);
        expect(values).toEqual([3, 1, 2]);
    });
});

describe('mergeRollupStats (MUK-471)', () => {
    const existing = { count: 100, p50: 1000, p75: 2000, p90: 3000, min: 500, max: 9000 };

    it('keeps the exact total count, the smaller min and the larger max (the old code overwrote them)', () => {
        const batch = { count: 5, p50: 1100, p75: 1200, p90: 1300, min: 800, max: 1400 };
        const merged = mergeRollupStats(existing, batch);
        expect(merged.count).toBe(105);
        expect(merged.min).toBe(500); // the stored minimum survives a batch whose minimum is higher
        expect(merged.max).toBe(9000); // ... and so does the stored maximum
    });

    it('takes a new extreme when the batch has one', () => {
        const merged = mergeRollupStats(existing, { count: 1, p50: 10, p75: 10, p90: 10, min: 10, max: 99999 });
        expect(merged.min).toBe(10);
        expect(merged.max).toBe(99999);
    });

    it('weights the percentiles by count, so a tiny batch barely moves a big rollup', () => {
        const merged = mergeRollupStats(existing, { count: 1, p50: 0, p75: 0, p90: 0, min: 0, max: 0 });
        expect(merged.p50).toBeCloseTo((1000 * 100) / 101, 6);
        expect(merged.p75).toBeCloseTo((2000 * 100) / 101, 6);
        expect(merged.p90).toBeCloseTo((3000 * 100) / 101, 6);
        // The old behaviour would have set p50/p75/p90 to 0 here.
        expect(merged.p50).toBeGreaterThan(900);
    });

    it('is a plain average when both sides have equal counts', () => {
        const merged = mergeRollupStats(
            { count: 10, p50: 100, p75: 200, p90: 300, min: 1, max: 2 },
            { count: 10, p50: 300, p75: 400, p90: 500, min: 0, max: 5 },
        );
        expect([merged.p50, merged.p75, merged.p90]).toEqual([200, 300, 400]);
    });

    it('is order-independent for count/min/max and keeps percentiles within the inputs\' range', () => {
        const a = { count: 30, p50: 100, p75: 150, p90: 200, min: 5, max: 250 };
        const b = { count: 70, p50: 300, p75: 350, p90: 400, min: 1, max: 500 };
        const ab = mergeRollupStats(a, b);
        const ba = mergeRollupStats(b, a);
        expect(ab.count).toBe(ba.count);
        expect(ab.min).toBe(ba.min);
        expect(ab.max).toBe(ba.max);
        expect(ab.p50).toBeCloseTo(ba.p50, 9);
        expect(ab.p50).toBeGreaterThanOrEqual(100);
        expect(ab.p50).toBeLessThanOrEqual(300);
    });

    it('returns the other side when one is empty', () => {
        const batch = { count: 3, p50: 1, p75: 2, p90: 3, min: 0, max: 4 };
        expect(mergeRollupStats({ count: 0, p50: 0, p75: 0, p90: 0, min: 0, max: 0 }, batch)).toBe(batch);
        expect(mergeRollupStats(existing, { count: 0, p50: 0, p75: 0, p90: 0, min: 0, max: 0 })).toBe(existing);
    });
});
