import { calculateEstimate, DEFAULT_ESTIMATOR_CONFIG } from './calculator';

describe('Estimator Calculator (R10)', () => {
    it('calculates base fee and ±15% range rounded to 500 SAR for external audit (< 5M, 1 entity, monthly books)', () => {
        // Base = 25,000 * 1.0 * 1.0 * 1.0 = 25,000
        // Min = 25,000 * 0.85 = 21,250 -> rounded to 500 = 21,500
        // Max = 25,000 * 1.15 = 28,750 -> rounded to 500 = 29,000
        const res = calculateEstimate(DEFAULT_ESTIMATOR_CONFIG, {
            service: 'external-audit',
            revenue: 'under-5m',
            entities: '1',
            books: 'monthly',
        });

        expect(res.currency).toBe('SAR');
        expect(res.min).toBe(21500);
        expect(res.max).toBe(29000);
    });

    it('applies multipliers for revenue band (20-50M x1.9), entities (2-3 x1.3), and books (partly x1.2)', () => {
        // Base (zakat-tax = 12,000) * 1.9 * 1.3 * 1.2 = 35,568
        // Min = 35,568 * 0.85 = 30,232.8 -> rounded to 500 = 30,000
        // Max = 35,568 * 1.15 = 40,903.2 -> rounded to 500 = 41,000
        const res = calculateEstimate(DEFAULT_ESTIMATOR_CONFIG, {
            service: 'zakat-tax',
            revenue: '20m-50m',
            entities: '2-3',
            books: 'partly',
        });

        expect(res.min).toBe(30000);
        expect(res.max).toBe(41000);
    });

    it('supports numeric revenue input matched against revenueBands', () => {
        // 10,000,000 SAR falls in <= 20,000,000 band (factor 1.4)
        // Base (local-content = 15,000) * 1.4 * 1.0 * 1.0 = 21,000
        // Min = 21,000 * 0.85 = 17,850 -> rounded to 500 = 18,000
        // Max = 21,000 * 1.15 = 24,150 -> rounded to 500 = 24,000
        const res = calculateEstimate(DEFAULT_ESTIMATOR_CONFIG, {
            service: 'local-content',
            revenue: 10_000_000,
            entities: '1',
            books: 'monthly',
        });

        expect(res.min).toBe(18000);
        expect(res.max).toBe(24000);
    });

    it('clamps negative or zero values to at least roundingTo (500 SAR)', () => {
        const res = calculateEstimate(
            {
                ...DEFAULT_ESTIMATOR_CONFIG,
                pricing: {
                    serviceBases: { custom: 100 },
                    revenueBands: [],
                    entityFactors: {},
                    booksFactors: {},
                },
            },
            { service: 'custom' },
        );

        expect(res.min).toBeGreaterThanOrEqual(500);
        expect(res.max).toBeGreaterThanOrEqual(res.min);
    });
});
