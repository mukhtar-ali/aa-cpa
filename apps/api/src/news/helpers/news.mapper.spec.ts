import { NewsMapper } from './news.mapper';

describe('NewsMapper', () => {
    const mockNews = {
        id: 'news-1',
        slug: 'cpa-tax-reform-2026',
        coverImage: { url: '/uploads/tax.jpg', alt: { ar: 'ضرائب', en: 'Taxes' }, width: 800, height: 600 },
        categoryId: 'cat-1',
        category: {
            id: 'cat-1',
            slug: 'tax-insights',
            name: { ar: 'رؤى ضريبية', en: 'Tax Insights' },
            isCaseStory: false,
        },
        authorId: 'auth-1',
        author: {
            id: 'auth-1',
            name: { ar: 'أحمد علي', en: 'Ahmed Ali' },
            role: { ar: 'شريك ضرائب', en: 'Tax Partner' },
            bio: { ar: 'خبير ضرائب', en: 'Tax Expert' },
            avatar: { url: '/uploads/ahmed.jpg' },
        },
        readingMinutes: null,
        tags: [{ ar: 'ضرائب', en: 'Tax' }, { ar: 'زكاة', en: 'Zakat' }],
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2026-03-01T10:00:00Z'),
        createdAt: new Date('2026-03-01T10:00:00Z'),
        updatedAt: new Date('2026-03-01T10:00:00Z'),
        translations: [
            {
                language: 'ar',
                title: 'تحديثات النظام الضريبي لعام 2026',
                excerpt: 'دليل شامل للتغييرات الضريبية الجديدة في المملكة',
                body: '<h2>مقدمة عامة</h2><p>نص تجريبي يتناول الضرائب بالتفصيل هنا للتحقق من حساب وقت القراءة واستخراج الفهرس.</p><h3>التطبيق العملي</h3><p>تفاصيل إضافية حول آلية التطبيق والتسجيل في البوابة.</p>',
                tocEnabled: true,
                metaTitle: 'تحديثات النظام الضريبي 2026',
                metaDescription: 'كل ما تحتاج معرفته عن الضرائب',
            },
            {
                language: 'en',
                title: '2026 Tax System Updates',
                excerpt: 'Comprehensive guide to new tax changes',
                body: '<h2>Overview</h2><p>Some test article text discussing tax updates in detail to verify reading time and table of contents.</p><h3>Practical Implementation</h3><p>Additional details on how to register and comply.</p>',
                tocEnabled: true,
                metaTitle: '2026 Tax Updates',
                metaDescription: 'Everything about tax changes',
            },
        ],
        sectors: [],
        services: [],
    };

    it('maps to Summary Web correctly in Arabic', () => {
        const summary = NewsMapper.toSummaryWeb(mockNews, 'ar');
        expect(summary.id).toBe('news-1');
        expect(summary.slug).toBe('cpa-tax-reform-2026');
        expect(summary.title).toBe('تحديثات النظام الضريبي لعام 2026');
        expect(summary.category).toBe('رؤى ضريبية');
        expect(summary.author?.name).toBe('أحمد علي');
        expect(summary.isFeatured).toBe(true);
        expect(summary.readingMinutes).toBeGreaterThanOrEqual(1);
    });

    it('extracts table of contents from HTML body', () => {
        const detail = NewsMapper.toDetailWeb(mockNews, 'ar');
        expect(detail.toc).toBeDefined();
        expect(detail.toc).toHaveLength(2);
        expect(detail.toc![0].label).toBe('مقدمة عامة');
        expect(detail.toc![1].label).toBe('التطبيق العملي');
    });

    it('computes reading time when not explicitly stored', () => {
        const detail = NewsMapper.toDetailWeb(mockNews, 'en');
        expect(detail.readingMinutes).toBeGreaterThanOrEqual(1);
    });

    it('falls back to Arabic when English translation is absent', () => {
        const arOnly = {
            ...mockNews,
            translations: [mockNews.translations[0]],
        };
        const summary = NewsMapper.toSummaryWeb(arOnly, 'en');
        expect(summary.title).toBe('تحديثات النظام الضريبي لعام 2026');
        expect(summary.isFallback).toBe(true);
    });

    it('maps to Admin representation with translation completeness', () => {
        const admin = NewsMapper.toAdmin(mockNews);
        expect(admin.id).toBe('news-1');
        expect(admin.title.ar).toBe('تحديثات النظام الضريبي لعام 2026');
        expect(admin.title.en).toBe('2026 Tax System Updates');
        expect(admin.translationStatus?.ar).toBe('complete');
        expect(admin.translationStatus?.en).toBe('complete');
    });
});
