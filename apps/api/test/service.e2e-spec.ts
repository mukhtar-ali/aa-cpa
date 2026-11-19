import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Services API (E2E)', () => {
    let app: INestApplication;
    let baseUrl: string;

    const mockServiceDb = [
        {
            id: 'serv-1',
            slug: 'external-audit',
            image: null,
            heroImage: null,
            icon: 'ShieldCheck',
            highlight: { label: { ar: 'دقة', en: 'Accuracy' }, value: { ar: '99%', en: '99%' } },
            methodology: [],
            deliverables: [],
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
                },
                {
                    id: 'tr-2',
                    serviceId: 'serv-1',
                    language: 'en',
                    title: 'External Audit',
                    summary: 'Certified audit services',
                },
            ],
            sectors: [],
            faqs: [],
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
        service: {
            findMany: jest.fn().mockResolvedValue(mockServiceDb),
            findFirst: jest.fn(({ where }: any) => {
                if (where?.slug === 'external-audit') return Promise.resolve(mockServiceDb[0]);
                return Promise.resolve(null);
            }),
            findUnique: jest.fn(({ where }: any) => {
                if (where?.id === 'serv-1') return Promise.resolve(mockServiceDb[0]);
                if (where?.slug === 'external-audit') return Promise.resolve(mockServiceDb[0]);
                return Promise.resolve(null);
            }),
            count: jest.fn().mockResolvedValue(1),
        },
        slugRedirect: {
            findUnique: jest.fn().mockResolvedValue(null),
        },
        contact: {
            count: jest.fn().mockResolvedValue(0),
        },
        articleService: {
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

    it('GET /api/services returns 200 with list of published services', async () => {
        const res = await fetch(`${baseUrl}/api/services`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        expect(body[0].slug).toBe('external-audit');
    });

    it('GET /api/services/:slug returns 200 for existing published service', async () => {
        const res = await fetch(`${baseUrl}/api/services/external-audit`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.slug).toBe('external-audit');
        expect(body.title).toBe('التدقيق الخارجي');
    });

    it('GET /api/services/:slug returns 404 for unknown slug', async () => {
        const res = await fetch(`${baseUrl}/api/services/non-existent-service`);
        expect(res.status).toBe(404);
    });
});
