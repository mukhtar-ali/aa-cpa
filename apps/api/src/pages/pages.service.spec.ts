import { NotFoundException } from '@nestjs/common';
import {
    AboutPageWebSchema,
    ArticlesPageWebSchema,
    CareersPageWebSchema,
    ContactPageWebSchema,
    HomePageWebSchema,
    LegalPageWebSchema,
    SectorsPageWebSchema,
    ServicesPageWebSchema,
    SiteChromeWebSchema,
} from '@repo/shared';
import { PagesService } from './pages.service';

describe('PagesService', () => {
    let service: PagesService;
    let prisma: any;

    const ml = (ar: string, en = '') => ({ ar, en });
    const imgField = {
        url: '/uploads/test.webp',
        width: 800,
        height: 600,
        alt: ml('صورة', 'Image'),
    };

    beforeEach(() => {
        prisma = {
            section: {
                findUnique: jest.fn().mockImplementation(({ where }: any) => {
                    if (where.type === 'site-chrome') {
                        return Promise.resolve({
                            type: 'site-chrome',
                            data: {
                                utilityBar: {
                                    licence: ml('ترخيص 118'),
                                    network: ml('عضو في شبكة دولية'),
                                    city: ml('الرياض'),
                                },
                                navItems: [
                                    { label: ml('الرئيسية', 'Home'), href: '/' },
                                    { label: ml('خدماتنا', 'Services'), href: '/services' },
                                ],
                                headerCta: { label: ml('تواصل معنا', 'Contact Us'), href: '/contact' },
                                footerDescription: ml('مكتب محاسبة قانونية ومراجعة', 'CPA Firm'),
                                registryNumbers: { cr: '1010000000', vat: '300000000000003' },
                                copyright: ml('جميع الحقوق محفوظة', 'All rights reserved'),
                                wordmark: ml('أحمد بن عبدالله', 'Ahmad Abdullah CPA'),
                                socials: [{ network: 'linkedin', url: 'https://linkedin.com' }],
                                contactChannels: [
                                    {
                                        type: 'phone',
                                        label: ml('الهاتف', 'Phone'),
                                        value: '+966110000000',
                                    },
                                ],
                            },
                        });
                    }
                    if (where.type === 'page-home') {
                        return Promise.resolve({
                            type: 'page-home',
                            data: {
                                hero: {
                                    title: ml('مكتب محاسبة ومراجعة قانونية'),
                                    accent: ml('بمعايير دقيقة'),
                                    body: ml('نقدم خدمات المراجعة والزكاة والضرائب'),
                                },
                                gap: {
                                    statement: ml('نسد الفجوة بين الأرقام والقرار'),
                                },
                                services: {
                                    eyebrow: ml('خدماتنا'),
                                    title: ml('حلول مهنية متكاملة'),
                                },
                                reasons: {
                                    title: ml('لماذا يختارنا العملاء'),
                                    pillars: [
                                        { title: ml('دقة'), body: ml('التزام بالمعايير') },
                                    ],
                                    stats: [
                                        { value: '+20', label: ml('عاماً من الخبرة') },
                                    ],
                                },
                                process: {
                                    title: ml('منهجية العمل'),
                                    steps: [{ title: ml('الفهم'), body: ml('دراسة النشاط') }],
                                },
                                partnerQuote: {
                                    title: ml('كلمة الشريك المدير'),
                                    body: ml('نلتزم بالجودة المهنية'),
                                },
                                news: {
                                    title: ml('أحدث المقالات'),
                                },
                                estimator: {
                                    title: ml('حاسبة الأتعاب التقديرية'),
                                    body: ml('احصل على تقدير فوري'),
                                },
                            },
                        });
                    }
                    if (where.type === 'page-about') {
                        return Promise.resolve({
                            type: 'page-about',
                            data: {
                                hero: { title: ml('عن المكتب') },
                                statement: ml('خبرة مهنية راسخة'),
                            },
                        });
                    }
                    if (where.type === 'page-services') {
                        return Promise.resolve({
                            type: 'page-services',
                            data: {
                                hero: { title: ml('خدماتنا المهنية') },
                                statement: ml('نغطي كافة احتياجات المنشآت'),
                            },
                        });
                    }
                    if (where.type === 'page-sectors') {
                        return Promise.resolve({
                            type: 'page-sectors',
                            data: {
                                hero: { title: ml('القطاعات التي نخدمها') },
                                statement: ml('فهم عميق لطبيعة كل قطاع'),
                            },
                        });
                    }
                    if (where.type === 'page-articles') {
                        return Promise.resolve({
                            type: 'page-articles',
                            data: {
                                hero: { title: ml('المدونة والمقالات المهنية') },
                            },
                        });
                    }
                    if (where.type === 'page-careers') {
                        return Promise.resolve({
                            type: 'page-careers',
                            data: {
                                hero: { title: ml('انضم إلى فريقنا') },
                            },
                        });
                    }
                    if (where.type === 'page-contact') {
                        return Promise.resolve({
                            type: 'page-contact',
                            data: {
                                hero: { title: ml('تواصل معنا') },
                                form: {
                                    title: ml('أرسل استفسارك'),
                                    successTitle: ml('تم الإرسال'),
                                },
                            },
                        });
                    }
                    if (where.type?.startsWith('legal-')) {
                        return Promise.resolve({
                            type: where.type,
                            data: {
                                version: '1.0',
                                updatedAt: '2026-11-18',
                                hero: { title: ml('سياسة الخصوصية') },
                                summary: [ml('ملخص السياسة')],
                                sections: [
                                    {
                                        id: 'sec-1',
                                        title: ml('جمع البيانات'),
                                        body: ml('<p>نلتزم بحماية البيانات</p>'),
                                    },
                                ],
                            },
                        });
                    }
                    if (where.type === 'estimator-config') {
                        return Promise.resolve({
                            type: 'estimator-config',
                            data: {
                                status: 'approved',
                                currency: 'SAR',
                                disclaimer: ml('تقدير استرشادي فقط'),
                                questions: [
                                    {
                                        id: 'service',
                                        title: ml('الخدمة المطلوبة'),
                                        type: 'select',
                                        options: [
                                            { id: 'audit', label: ml('مراجعة خارجية'), value: 'audit' },
                                        ],
                                    },
                                ],
                            },
                        });
                    }
                    return Promise.resolve(null);
                }),
            },
            seo: {
                findUnique: jest.fn().mockResolvedValue({
                    pageKey: 'home',
                    title: ml('الرئيسية'),
                    description: ml('وصف الصفحة'),
                }),
            },
            service: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'srv-1',
                        slug: 'external-audit',
                        image: imgField,
                        order: 1,
                        isPublished: true,
                        isDeleted: false,
                        translations: [
                            {
                                language: 'ar',
                                title: 'المراجعة الخارجية',
                                summary: 'خدمات مراجعة القوائم المالية',
                            },
                        ],
                    },
                ]),
            },
            sector: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'sec-1',
                        slug: 'contracting',
                        featured: true,
                        bandImage: imgField,
                        order: 1,
                        isPublished: true,
                        isDeleted: false,
                        translations: [
                            {
                                language: 'ar',
                                title: 'قطاع المقاولات',
                                summary: 'حلول محاسبية للمقاولات',
                                bandTitle: 'خبرة في المقاولات',
                            },
                        ],
                    },
                ]),
            },
            news: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'art-1',
                        slug: 'zakat-guide',
                        thumbnail: imgField,
                        isPublished: true,
                        isFeatured: true,
                        publishedAt: new Date('2026-11-01T00:00:00Z'),
                        createdAt: new Date('2026-11-01T00:00:00Z'),
                        readingMinutes: 4,
                        category: {
                            id: 'cat-1',
                            slug: 'zakat',
                            name: ml('الزكاة والضرائب'),
                            isCaseStory: true,
                        },
                        translations: [
                            {
                                language: 'ar',
                                title: 'دليل الزكاة للمنشآت',
                                excerpt: 'كل ما تحتاج معرفته',
                                body: '<p>محتوى المقال</p>',
                            },
                        ],
                        sectors: [],
                        services: [],
                    },
                ]),
                count: jest.fn().mockResolvedValue(1),
            },
            articleCategory: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'cat-1',
                        slug: 'zakat',
                        name: ml('الزكاة والضرائب'),
                        order: 1,
                        isCaseStory: false,
                    },
                ]),
            },
            job: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'job-1',
                        slug: 'senior-auditor',
                        employmentType: 'full_time',
                        experienceMin: 4,
                        experienceMax: 7,
                        isPublished: true,
                        isDeleted: false,
                        closesAt: null,
                        department: {
                            id: 'dep-1',
                            slug: 'audit',
                            name: ml('المراجعة'),
                        },
                        office: {
                            id: 'off-1',
                            city: ml('الرياض'),
                        },
                        translations: [
                            {
                                language: 'ar',
                                title: 'مراجع أول',
                                summary: 'قيادة فرق المراجعة',
                                body: '<p>تفاصيل الوظيفة</p>',
                            },
                        ],
                    },
                ]),
            },
            jobDepartment: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'dep-1',
                        slug: 'audit',
                        name: ml('المراجعة'),
                        order: 1,
                    },
                ]),
            },
            office: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'off-1',
                        city: ml('الرياض'),
                        address: ml('طريق الملك فهد'),
                        isHeadquarters: true,
                        isPublished: true,
                        isDeleted: false,
                        order: 1,
                    },
                ]),
            },
            clientLogo: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'logo-1',
                        name: 'Client A',
                        logo: imgField,
                        row: 1,
                        order: 1,
                        isPublished: true,
                        isDeleted: false,
                    },
                ]),
            },
            credential: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'cred-1',
                        name: ml('SOCPA'),
                        logo: imgField,
                        order: 1,
                        isPublished: true,
                        isDeleted: false,
                    },
                ]),
            },
            testimonial: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'test-1',
                        quote: ml('شريك مهني موثوق'),
                        name: ml('خالد العتيبي'),
                        role: ml('المدير المالي'),
                        placement: ['home', 'about', 'services', 'sectors', 'articles'],
                        order: 1,
                        isPublished: true,
                        isDeleted: false,
                    },
                ]),
            },
            faqItem: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'faq-1',
                        question: ml('كيف نبدأ؟'),
                        answer: ml('<p>تواصل معنا</p>'),
                        scope: 'contact',
                        order: 1,
                        isPublished: true,
                        isDeleted: false,
                    },
                ]),
            },
        };

        service = new PagesService(prisma);
    });

    it('returns site chrome matching SiteChromeWebSchema', async () => {
        const res = await service.getSiteChrome('ar');
        const parsed = SiteChromeWebSchema.safeParse(res);
        expect(parsed.success).toBe(true);
    });

    it('returns home page matching HomePageWebSchema with estimator', async () => {
        const res = await service.getHomePage('ar');
        const parsed = HomePageWebSchema.safeParse(res);
        expect(parsed.success).toBe(true);
        expect(res.estimator).toBeDefined();
    });

    it('returns about page matching AboutPageWebSchema with estimator', async () => {
        const res = await service.getAboutPage('ar');
        const parsed = AboutPageWebSchema.safeParse(res);
        expect(parsed.success).toBe(true);
        expect(res.estimator).toBeDefined();
    });

    it('returns services page matching ServicesPageWebSchema with estimator', async () => {
        const res = await service.getServicesPage('ar');
        const parsed = ServicesPageWebSchema.safeParse(res);
        expect(parsed.success).toBe(true);
        expect(res.estimator).toBeDefined();
    });

    it('returns sectors page matching SectorsPageWebSchema with estimator', async () => {
        const res = await service.getSectorsPage('ar');
        const parsed = SectorsPageWebSchema.safeParse(res);
        expect(parsed.success).toBe(true);
        expect(res.estimator).toBeDefined();
    });

    it('returns articles page matching ArticlesPageWebSchema with estimator', async () => {
        const res = await service.getArticlesPage('ar', {});
        const parsed = ArticlesPageWebSchema.safeParse(res);
        expect(parsed.success).toBe(true);
        expect(res.estimator).toBeDefined();
        expect(res.pagination).toEqual({ page: 1, pageSize: 12, total: 1, totalPages: 1 });
    });

    it('filters articles by sector', async () => {
        await service.getArticlesPage('ar', { sector: 'retail' });
        const where = (prisma.news.findMany as jest.Mock).mock.calls.at(-1)[0].where;
        expect(where.sectors).toEqual({ some: { sector: { slug: 'retail' } } });
    });

    it('returns careers page matching CareersPageWebSchema without estimator', async () => {
        const res = await service.getCareersPage('ar', {});
        const parsed = CareersPageWebSchema.safeParse(res);
        expect(parsed.success).toBe(true);
        expect((res as any).estimator).toBeUndefined();
    });

    it('returns contact page matching ContactPageWebSchema without estimator', async () => {
        const res = await service.getContactPage('ar');
        const parsed = ContactPageWebSchema.safeParse(res);
        expect(parsed.success).toBe(true);
        expect((res as any).estimator).toBeUndefined();
    });

    it('returns legal pages for privacy, terms, accessibility matching LegalPageWebSchema', async () => {
        for (const key of ['privacy', 'terms', 'accessibility']) {
            const res = await service.getLegalPage(key, 'ar');
            const parsed = LegalPageWebSchema.safeParse(res);
            expect(parsed.success).toBe(true);
        }
    });

    it('uses CMS text in the requested language instead of the built-in fallback', async () => {
        const original = prisma.section.findUnique;
        prisma.section.findUnique = jest.fn().mockResolvedValue({ data: { statement: { ar: 'نص مخصص', en: 'Custom statement' } } });
        try {
            expect((await service.getAboutPage('en')).statement).toBe('Custom statement');
            expect((await service.getAboutPage('ar')).statement).toBe('نص مخصص');
        } finally {
            prisma.section.findUnique = original;
        }
    });

    it('strips scripts and event handlers from legal section bodies', async () => {
        const original = prisma.section.findUnique;
        prisma.section.findUnique = jest.fn().mockResolvedValue({
            data: {
                sections: [{ id: 'a', title: ml('T', 'T'), body: ml('<p onclick="x()">ok</p><script>alert(1)</script><a href="javascript:alert(1)">l</a>', 'x') }],
            },
        });
        try {
            const res = await service.getLegalPage('privacy', 'ar');
            expect(res.sections[0].body).toContain('ok');
            expect(res.sections[0].body).not.toMatch(/script|onclick|javascript:/i);
        } finally {
            prisma.section.findUnique = original;
        }
    });

    it('throws NotFoundException for unknown legal page key', async () => {
        await expect(service.getLegalPage('unknown', 'ar')).rejects.toThrow(NotFoundException);
    });
});
