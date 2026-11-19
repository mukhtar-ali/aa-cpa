import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Sectors API (E2E)', () => {
    let app: INestApplication;
    let baseUrl: string;

    const mockSectorDb = [
        {
            id: 'sec-1',
            slug: 'financial-services',
            icon: 'Briefcase',
            featured: true,
            bandImage: null,
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
                    sectorId: 'sec-1',
                    language: 'ar',
                    title: 'الخدمات المالية والبنكية',
                    summary: 'حلول محاسبية متقدمة للبنوك والشركات المالية',
                    bandTitle: 'شريكك المالي الموثوق',
                    bandBody: 'تفاصيل الدعم المصرفي',
                    bandCtaLabel: 'تواصل معنا',
                },
                {
                    id: 'tr-2',
                    sectorId: 'sec-1',
                    language: 'en',
                    title: 'Financial & Banking Services',
                    summary: 'Advanced accounting solutions for banks and financial institutions',
                    bandTitle: 'Your Trusted Financial Partner',
                    bandBody: 'Banking support details',
                    bandCtaLabel: 'Contact Us',
                },
            ],
            services: [],
            articles: [],
        },
    ];

    const mockPrisma = {
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        onModuleInit: jest.fn().mockResolvedValue(undefined),
        onModuleDestroy: jest.fn().mockResolvedValue(undefined),
        section: {
            findUnique: jest.fn().mockResolvedValue(null),
        },
        sector: {
            findMany: jest.fn().mockResolvedValue(mockSectorDb),
            findFirst: jest.fn(({ where }: any) => {
                if (where?.slug === 'financial-services') return Promise.resolve(mockSectorDb[0]);
                return Promise.resolve(null);
            }),
            findUnique: jest.fn(({ where }: any) => {
                if (where?.id === 'sec-1') return Promise.resolve(mockSectorDb[0]);
                if (where?.slug === 'financial-services') return Promise.resolve(mockSectorDb[0]);
                return Promise.resolve(null);
            }),
            count: jest.fn().mockResolvedValue(1),
        },
        slugRedirect: {
            findUnique: jest.fn().mockResolvedValue(null),
        },
        articleSector: {
            count: jest.fn().mockResolvedValue(0),
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

    it('GET /api/sectors returns 200 with list of published sectors', async () => {
        const res = await fetch(`${baseUrl}/api/sectors`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        expect(body[0].slug).toBe('financial-services');
    });

    it('GET /api/sectors/:slug returns 200 for existing published sector', async () => {
        const res = await fetch(`${baseUrl}/api/sectors/financial-services`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.slug).toBe('financial-services');
        expect(body.title).toBe('الخدمات المالية والبنكية');
    });

    it('GET /api/sectors/:slug returns 404 for unknown slug', async () => {
        const res = await fetch(`${baseUrl}/api/sectors/non-existent-sector`);
        expect(res.status).toBe(404);
    });
});
