export interface EstimatorCalculationResult {
    baseFee: number;
    min: number;
    max: number;
    currency: string;
}

export const DEFAULT_ESTIMATOR_CONFIG = {
    status: 'draft' as 'draft' | 'approved',
    currency: 'SAR',
    spreadPercent: 15,
    roundingTo: 500,
    disclaimer: {
        ar: 'هذا التقدير استرشادي فقط ولا يُعد عرض سعر ملزماً، وتُحدد الأتعاب النهائية بعد دراسة نطاق العمل التفصيلي.',
        en: 'This estimate is indicative only and does not constitute a binding offer. Final fees are determined after scoping.',
    },
    questions: [
        {
            id: 'service',
            title: { ar: 'الخدمة المهنية المطلوبة', en: 'Required Professional Service' },
            type: 'select' as const,
            options: [
                {
                    id: 'external-audit',
                    label: { ar: 'المراجعة الخارجية للقوائم المالية', en: 'External Audit' },
                    value: 'external-audit',
                },
                {
                    id: 'zakat-tax',
                    label: { ar: 'الزكاة والضرائب', en: 'Zakat & Tax' },
                    value: 'zakat-tax',
                },
                {
                    id: 'local-content',
                    label: { ar: 'شهادات المحتوى المحلي', en: 'Local Content Certification' },
                    value: 'local-content',
                },
                {
                    id: 'accounting',
                    label: { ar: 'المحاسبة ومسك الدفاتر', en: 'Accounting & Bookkeeping' },
                    value: 'accounting',
                },
                {
                    id: 'due-diligence',
                    label: { ar: 'الفحص النافي للجهالة المالية', en: 'Financial Due Diligence' },
                    value: 'due-diligence',
                },
            ],
        },
        {
            id: 'revenue',
            title: { ar: 'الإيرادات السنوية للمنشأة (ريال سعودي)', en: 'Annual Revenue (SAR)' },
            type: 'select' as const,
            options: [
                {
                    id: 'under-5m',
                    label: { ar: 'أقل من 5 ملايين ريال', en: 'Under 5M SAR' },
                    value: 'under-5m',
                    factor: 1.0,
                },
                {
                    id: '5m-20m',
                    label: { ar: 'من 5 إلى 20 مليون ريال', en: '5M – 20M SAR' },
                    value: '5m-20m',
                    factor: 1.4,
                },
                {
                    id: '20m-50m',
                    label: { ar: 'من 20 إلى 50 مليون ريال', en: '20M – 50M SAR' },
                    value: '20m-50m',
                    factor: 1.9,
                },
                {
                    id: '50m-200m',
                    label: { ar: 'من 50 إلى 200 مليون ريال', en: '50M – 200M SAR' },
                    value: '50m-200m',
                    factor: 2.6,
                },
                {
                    id: 'over-200m',
                    label: { ar: 'أكثر من 200 مليون ريال', en: 'Over 200M SAR' },
                    value: 'over-200m',
                    factor: 3.5,
                },
            ],
        },
        {
            id: 'entities',
            title: { ar: 'عدد الكيانات القانونية أو الفروع', en: 'Number of Legal Entities / Branches' },
            type: 'radio' as const,
            options: [
                { id: '1', label: { ar: 'كيان واحد', en: '1 Entity' }, value: '1', factor: 1.0 },
                { id: '2-3', label: { ar: '2 – 3 كيانات', en: '2 – 3 Entities' }, value: '2-3', factor: 1.3 },
                { id: '4-10', label: { ar: '4 – 10 كيانات', en: '4 – 10 Entities' }, value: '4-10', factor: 1.7 },
                { id: '10+', label: { ar: 'أكثر من 10 كيانات', en: '10+ Entities' }, value: '10+', factor: 2.2 },
            ],
        },
        {
            id: 'books',
            title: { ar: 'حالة الدفاتر المحاسبية', en: 'State of Accounting Books' },
            type: 'radio' as const,
            options: [
                {
                    id: 'monthly',
                    label: { ar: 'مقفلة شهرياً ومنظمة', en: 'Closed Monthly & Organised' },
                    value: 'monthly',
                    factor: 1.0,
                },
                {
                    id: 'partly',
                    label: { ar: 'منظمة جزئياً', en: 'Partly Organised' },
                    value: 'partly',
                    factor: 1.2,
                },
                {
                    id: 'unorganised',
                    label: { ar: 'غير منظمة / تحتاج تأسيس', en: 'Not Organised' },
                    value: 'unorganised',
                    factor: 1.5,
                },
            ],
        },
    ],
    pricing: {
        serviceBases: {
            'external-audit': 25000,
            'zakat-tax': 12000,
            'local-content': 15000,
            'accounting': 18000,
            'due-diligence': 30000,
        } as Record<string, number>,
        revenueBands: [
            { maxRevenue: 5_000_000, factor: 1.0 },
            { maxRevenue: 20_000_000, factor: 1.4 },
            { maxRevenue: 50_000_000, factor: 1.9 },
            { maxRevenue: 200_000_000, factor: 2.6 },
            { maxRevenue: Number.MAX_SAFE_INTEGER, factor: 3.5 },
        ],
        revenueBandFactors: {
            'under-5m': 1.0,
            '5m-20m': 1.4,
            '20m-50m': 1.9,
            '50m-200m': 2.6,
            'over-200m': 3.5,
        } as Record<string, number>,
        entityFactors: {
            '1': 1.0,
            '2-3': 1.3,
            '4-10': 1.7,
            '10+': 2.2,
        } as Record<string, number>,
        booksFactors: {
            monthly: 1.0,
            partly: 1.2,
            unorganised: 1.5,
            not_organised: 1.5,
        } as Record<string, number>,
    },
};

export function roundToIncrement(value: number, increment: number): number {
    const step = increment > 0 ? increment : 500;
    const rounded = Math.round((value + 1e-9) / step) * step;
    return Math.max(step, rounded);
}

export function calculateEstimate(
    config: Record<string, any>,
    answers: Record<string, string | number>,
): EstimatorCalculationResult {
    const pricing = config?.pricing || DEFAULT_ESTIMATOR_CONFIG.pricing;
    const serviceBases: Record<string, number> =
        pricing?.serviceBases || DEFAULT_ESTIMATOR_CONFIG.pricing.serviceBases;
    const entityFactors: Record<string, number> =
        pricing?.entityFactors || DEFAULT_ESTIMATOR_CONFIG.pricing.entityFactors;
    const booksFactors: Record<string, number> =
        pricing?.booksFactors || DEFAULT_ESTIMATOR_CONFIG.pricing.booksFactors;
    const revenueBandFactors: Record<string, number> =
        pricing?.revenueBandFactors || DEFAULT_ESTIMATOR_CONFIG.pricing.revenueBandFactors;
    const revenueBands: { maxRevenue: number; factor: number }[] =
        Array.isArray(pricing?.revenueBands) && pricing.revenueBands.length > 0
            ? pricing.revenueBands
            : DEFAULT_ESTIMATOR_CONFIG.pricing.revenueBands;

    const serviceKey = String(answers?.service || 'external-audit');
    const base = serviceBases[serviceKey] ?? 25000;

    // Resolve revenue factor (either band slug or numeric SAR amount)
    const rawRev = answers?.revenue ?? answers?.revenueBand;
    let revenueFactor = 1.0;
    if (typeof rawRev === 'number' || (typeof rawRev === 'string' && /^\d+(\.\d+)?$/.test(rawRev))) {
        const revNum = Number(rawRev);
        const sorted = [...revenueBands].sort((a, b) => a.maxRevenue - b.maxRevenue);
        const matched = sorted.find((b) => revNum <= b.maxRevenue) || sorted[sorted.length - 1];
        if (matched) {
            revenueFactor = matched.factor;
        }
    } else if (typeof rawRev === 'string' && rawRev) {
        if (revenueBandFactors[rawRev] !== undefined) {
            revenueFactor = revenueBandFactors[rawRev];
        } else {
            // Check option factor in questions array
            const revQ = (config?.questions || []).find((q: any) => q.id === 'revenue');
            const opt = revQ?.options?.find(
                (o: any) => o.id === rawRev || o.value === rawRev,
            );
            if (opt?.factor) {
                revenueFactor = Number(opt.factor);
            }
        }
    }

    const entitiesKey = String(answers?.entities ?? '1');
    const entitiesFactor = entityFactors[entitiesKey] ?? 1.0;

    const booksKey = String(answers?.books ?? 'monthly');
    const booksFactor = booksFactors[booksKey] ?? 1.0;

    const baseFee = base * revenueFactor * entitiesFactor * booksFactor;
    const spreadPercent =
        typeof config?.spreadPercent === 'number' && config.spreadPercent >= 0
            ? config.spreadPercent
            : 15;
    const roundingTo =
        typeof config?.roundingTo === 'number' && config.roundingTo > 0
            ? config.roundingTo
            : 500;

    const spreadRatio = spreadPercent / 100;
    const rawMin = baseFee * (1 - spreadRatio);
    const rawMax = baseFee * (1 + spreadRatio);

    const min = roundToIncrement(rawMin, roundingTo);
    const max = Math.max(min, roundToIncrement(rawMax, roundingTo));

    return {
        baseFee,
        min,
        max,
        currency: config?.currency || 'SAR',
    };
}
