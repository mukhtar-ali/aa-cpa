import { ServiceDetailWebSchema, ServiceSummaryWebSchema } from '@repo/shared';
import { ServiceMapper } from './service.mapper';

describe('ServiceMapper', () => {
    const mockService = {
        id: 'serv-1',
        slug: 'external-audit',
        image: { url: '/images/audit.jpg', width: 800, height: 600, alt: { ar: 'تدقيق', en: 'Audit' } },
        heroImage: null,
        icon: 'ShieldCheck',
        highlight: {
          label: { ar: 'نسبة الدقة', en: 'Accuracy' },
          value: { ar: '99.9%', en: '99.9%' },
          note: { ar: 'معتمد', en: 'Certified' },
        },
        methodology: [
          { title: { ar: 'التخطيط', en: 'Planning' }, body: { ar: 'شرح التخطيط', en: 'Planning body' } },
        ],
        deliverables: [
          { title: { ar: 'تقرير المراجع', en: 'Auditor Report' } },
        ],
        order: 1,
        isPublished: true,
        publishedAt: new Date('2026-01-01'),
        isDeleted: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        deletedAt: null,
        translations: [
            {
                id: 'tr-1',
                serviceId: 'serv-1',
                language: 'ar',
                title: 'التدقيق الخارجي',
                summary: 'خدمات تدقيق معتمدة',
                heroSubtitle: 'فحص مالي مستقل',
                statement: 'بيان الخدمة بالعربية',
                audience: 'الشركات المساهمة',
                whyUs: 'لماذا تختارنا',
                metaTitle: 'تدقيق خارجي',
                metaDescription: 'وصف سيو',
                keywords: 'تدقيق, محاسبة',
            },
            {
                id: 'tr-2',
                serviceId: 'serv-1',
                language: 'en',
                title: 'External Audit',
                summary: 'Certified audit services',
                heroSubtitle: 'Independent assurance',
                statement: 'English statement',
                audience: 'Corporates',
                whyUs: 'Why choose us',
                metaTitle: 'External Audit',
                metaDescription: 'SEO description',
                keywords: 'audit, cpa',
            },
        ],
        sectors: [
          {
            sector: {
              id: 'sec-1',
              slug: 'financial-services',
              translations: [
                { language: 'ar', title: 'الخدمات المالية' },
                { language: 'en', title: 'Financial Services' },
              ],
            },
          },
        ],
        faqs: [
          {
            id: 'faq-1',
            question: { ar: 'سؤال 1', en: 'Question 1' },
            answer: { ar: 'جواب 1', en: 'Answer 1' },
          },
        ],
    };

    it('maps to ServiceSummaryWeb in Arabic', () => {
        const summary = ServiceMapper.toSummaryWeb(mockService as any, 'ar');
        expect(ServiceSummaryWebSchema.safeParse(summary).success).toBe(true);
        expect(summary.title).toBe('التدقيق الخارجي');
        expect(summary.highlight?.label).toBe('نسبة الدقة');
    });

    it('maps to ServiceSummaryWeb in English', () => {
        const summary = ServiceMapper.toSummaryWeb(mockService as any, 'en');
        expect(ServiceSummaryWebSchema.safeParse(summary).success).toBe(true);
        expect(summary.title).toBe('External Audit');
        expect(summary.highlight?.label).toBe('Accuracy');
    });

    it('falls back to Arabic when requested English translation is missing', () => {
        const serviceWithArabicOnly = {
            ...mockService,
            translations: [mockService.translations[0]],
        };
        const summary = ServiceMapper.toSummaryWeb(serviceWithArabicOnly as any, 'en');
        expect(summary.title).toBe('التدقيق الخارجي');
        expect(summary.isFallback).toBe(true);
    });

    it('maps to ServiceDetailWeb with methodology, deliverables, sectors, faqs', () => {
        const detail = ServiceMapper.toDetailWeb(mockService as any, 'ar');
        expect(ServiceDetailWebSchema.safeParse(detail).success).toBe(true);
        expect(detail.title).toBe('التدقيق الخارجي');
        expect(detail.methodology).toHaveLength(1);
        expect(detail.methodology[0].title).toBe('التخطيط');
        expect(detail.deliverables).toHaveLength(1);
        expect(detail.deliverables[0].title).toBe('تقرير المراجع');
        expect(detail.sectors).toHaveLength(1);
        expect(detail.sectors?.[0].title).toBe('الخدمات المالية');
        expect(detail.faqs).toHaveLength(1);
        expect(detail.faqs?.[0].question).toBe('سؤال 1');
        expect(detail.seo?.noindex).toBe(false);
    });

    it('maps to ServiceAdmin with ogImage and noindex', () => {
        const serviceWithSeo = {
            ...mockService,
            ogImage: { url: 'https://example.com/custom-og.jpg', alt: { ar: 'صورة', en: 'Image' }, width: 1200, height: 630 },
            noindex: true,
        };
        const admin = ServiceMapper.toAdmin(serviceWithSeo as any);
        expect(admin.noindex).toBe(true);
        expect(admin.ogImage).toEqual(serviceWithSeo.ogImage);

        const detail = ServiceMapper.toDetailWeb(serviceWithSeo as any, 'ar');
        expect(detail.seo?.ogImage).toBe('https://example.com/custom-og.jpg');
        expect(detail.seo?.noindex).toBe(true);
    });
});
