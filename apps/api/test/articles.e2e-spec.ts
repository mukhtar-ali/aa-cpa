import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Articles API (E2E)', () => {
    let app: INestApplication;
    let baseUrl: string;

    const mockCategory = {
        id: 'cat-1',
        slug: 'tax-insights',
        name: { ar: 'رؤى ضريبية', en: 'Tax Insights' },
        isCaseStory: false,
        order: 0,
        isDeleted: false,
    };

    const mockAuthor = {
        id: 'auth-1',
        name: { ar: 'أحمد علي', en: 'Ahmed Ali' },
        role: { ar: 'شريك', en: 'Partner' },
        bio: { ar: 'خبير', en: 'Expert' },
        avatar: null,
        order: 0,
        isDeleted: false,
    };

    const mockArticle = {
        id: 'art-1',
        slug: 'vat-compliance-saudi',
        coverImage: { url: '/uploads/vat.jpg', alt: { ar: 'ضريبة القيمة المضافة', en: 'VAT' } },
        categoryId: 'cat-1',
        category: mockCategory,
        authorId: 'auth-1',
        author: mockAuthor,
        readingMinutes: 5,
        tags: [{ ar: 'ضريبة', en: 'Tax' }],
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date('2026-01-01'),
        isDeleted: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        deletedAt: null,
        translations: [
            {
                id: 'tr-1',
                newsId: 'art-1',
                language: 'ar',
                title: 'دليل الامتثال لضريبة القيمة المضافة',
                excerpt: 'ملخص شامل للتطبيق في الشركات',
                body: '<h2>نظرة عامة</h2><p>تفاصيل ضريبة القيمة المضافة في السعودية</p>',
                tocEnabled: true,
                metaTitle: 'ضريبة القيمة المضافة',
                metaDescription: 'دليل الشركات للامتثال',
                keywords: 'ضريبة, زكاة',
            },
            {
                id: 'tr-2',
                newsId: 'art-1',
                language: 'en',
                title: 'VAT Compliance Guide',
                excerpt: 'Comprehensive summary for businesses',
                body: '<h2>Overview</h2><p>VAT details in Saudi Arabia</p>',
                tocEnabled: true,
                metaTitle: 'VAT Guide',
                metaDescription: 'Compliance Guide',
                keywords: 'tax, vat',
            },
        ],
        sectors: [],
        services: [],
    };

    const mockPrisma = {
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        onModuleInit: jest.fn().mockResolvedValue(undefined),
        onModuleDestroy: jest.fn().mockResolvedValue(undefined),
        section: {
            findUnique: jest.fn().mockResolvedValue(null),
        },
        news: {
            findMany: jest.fn().mockResolvedValue([mockArticle]),
            findFirst: jest.fn(({ where }: any) => {
                if (where?.slug === 'vat-compliance-saudi') return Promise.resolve(mockArticle);
                return Promise.resolve(null);
            }),
            findUnique: jest.fn(({ where }: any) => {
                if (where?.id === 'art-1' || where?.slug === 'vat-compliance-saudi') return Promise.resolve(mockArticle);
                return Promise.resolve(null);
            }),
            count: jest.fn().mockResolvedValue(1),
        },
        articleCategory: {
            findMany: jest.fn().mockResolvedValue([mockCategory]),
            findFirst: jest.fn().mockResolvedValue(mockCategory),
            findUnique: jest.fn().mockResolvedValue(mockCategory),
            count: jest.fn().mockResolvedValue(1),
        },
        author: {
            findMany: jest.fn().mockResolvedValue([mockAuthor]),
            findUnique: jest.fn().mockResolvedValue(mockAuthor),
            count: jest.fn().mockResolvedValue(1),
        },
        slugRedirect: {
            findUnique: jest.fn().mockResolvedValue(null),
        },
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrisma)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.listen(0);
        const server = app.getHttpServer();
        const address = server.address();
        const port = typeof address === 'string' ? address : address.port;
        baseUrl = `http://127.0.0.1:${port}`;
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('GET /api/articles returns 200 with list of published articles', async () => {
        const res = await fetch(`${baseUrl}/api/articles`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('items');
        expect(Array.isArray(body.items)).toBe(true);
        expect(body.items[0].slug).toBe('vat-compliance-saudi');
    });

    it('GET /api/articles/:slug returns 200 with article details and toc', async () => {
        const res = await fetch(`${baseUrl}/api/articles/vat-compliance-saudi`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.slug).toBe('vat-compliance-saudi');
        expect(body.title).toBe('دليل الامتثال لضريبة القيمة المضافة');
        expect(body.toc).toBeDefined();
        expect(body.toc.length).toBeGreaterThan(0);
    });

    it('GET /api/articles/:slug returns 404 for unknown article', async () => {
        const res = await fetch(`${baseUrl}/api/articles/unknown-article`);
        expect(res.status).toBe(404);
    });
});
