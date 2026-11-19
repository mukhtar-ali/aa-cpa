import { SectorMapper } from './sector.mapper';

describe('SectorMapper', () => {
    const mockSector = {
        id: 'sec-1',
        slug: 'financial-services',
        icon: 'Briefcase',
        featured: true,
        bandImage: { url: '/uploads/band.jpg', alt: { ar: 'صورة', en: 'Image' }, width: 1200, height: 400 },
        order: 1,
        isPublished: true,
        publishedAt: new Date('2026-01-01'),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        translations: [
            {
                language: 'ar',
                title: 'الخدمات المالية والبنكية',
                summary: 'حلول محاسبية متقدمة للبنوك والشركات المالية',
                bandTitle: 'شريكك المالي الموثوق',
                bandBody: 'نساعد المؤسسات المالية على الامتثال لمعايير IFRS',
                bandCtaLabel: 'تواصل معنا',
                metaTitle: 'قطاع الخدمات المالية | CPA',
                metaDescription: 'وصف سيو لقطاع الخدمات المالية',
            },
            {
                language: 'en',
                title: 'Financial & Banking Services',
                summary: 'Advanced accounting solutions for banks and financial institutions',
                bandTitle: 'Your Trusted Financial Partner',
                bandBody: 'Helping financial institutions comply with IFRS standards',
                bandCtaLabel: 'Contact Us',
                metaTitle: 'Financial Services Sector | CPA',
                metaDescription: 'SEO description for financial sector',
            },
        ],
        services: [
            {
                service: {
                    id: 'serv-1',
                    slug: 'external-audit',
                    translations: [
                        { language: 'ar', title: 'التدقيق الخارجي' },
                        { language: 'en', title: 'External Audit' },
                    ],
                },
            },
        ],
    };

    it('maps to Arabic Summary Web correctly', () => {
        const result = SectorMapper.toSummaryWeb(mockSector, 'ar');
        expect(result.id).toBe('sec-1');
        expect(result.slug).toBe('financial-services');
        expect(result.title).toBe('الخدمات المالية والبنكية');
        expect(result.summary).toBe('حلول محاسبية متقدمة للبنوك والشركات المالية');
        expect(result.icon).toBe('Briefcase');
        expect(result.featured).toBe(true);
        expect(result.isFallback).toBe(false);
    });

    it('maps to English Summary Web correctly', () => {
        const result = SectorMapper.toSummaryWeb(mockSector, 'en');
        expect(result.slug).toBe('financial-services');
        expect(result.title).toBe('Financial & Banking Services');
        expect(result.isFallback).toBe(false);
    });

    it('falls back to Arabic when English translation is missing', () => {
        const arOnlySector = {
            ...mockSector,
            translations: [mockSector.translations[0]],
        };
        const result = SectorMapper.toSummaryWeb(arOnlySector, 'en');
        expect(result.title).toBe('الخدمات المالية والبنكية');
        expect(result.isFallback).toBe(true);
    });

    it('maps to Detail Web including related services', () => {
        const result = SectorMapper.toDetailWeb(mockSector, 'ar');
        expect(result.bandTitle).toBe('شريكك المالي الموثوق');
        expect(result.bandBody).toBe('نساعد المؤسسات المالية على الامتثال لمعايير IFRS');
        expect(result.services).toHaveLength(1);
        expect(result.services![0].slug).toBe('external-audit');
        expect(result.services![0].title).toBe('التدقيق الخارجي');
    });

    it('maps to Admin representation with translation status', () => {
        const result = SectorMapper.toAdmin(mockSector);
        expect(result.id).toBe('sec-1');
        expect(result.title.ar).toBe('الخدمات المالية والبنكية');
        expect(result.title.en).toBe('Financial & Banking Services');
        expect(result.translationStatus.ar).toBe('complete');
        expect(result.translationStatus.en).toBe('complete');
    });
});
