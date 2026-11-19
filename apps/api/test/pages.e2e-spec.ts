import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
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

describe('Pages & Site Chrome Endpoints (E2E)', () => {
    let app: INestApplication;
    let baseUrl: string;
    const ml = (ar: string, en = '') => ({ ar, en });

    const mockPrisma = {
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        onModuleInit: jest.fn().mockResolvedValue(undefined),
        onModuleDestroy: jest.fn().mockResolvedValue(undefined),
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
                            navItems: [{ label: ml('الرئيسية'), href: '/' }],
                            headerCta: { label: ml('تواصل معنا'), href: '/contact' },
                            footerDescription: ml('مكتب محاسبة قانونية'),
                            registryNumbers: { cr: '1010000000', vat: '300000000000003' },
                            copyright: ml('جميع الحقوق محفوظة'),
                            wordmark: ml('أحمد بن عبدالله'),
                            socials: [{ network: 'linkedin', url: 'https://linkedin.com' }],
                            contactChannels: [
                                { type: 'phone', label: ml('الهاتف'), value: '+966110000000' },
                            ],
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
                            summary: [ml('ملخص')],
                            sections: [
                                { id: 's1', title: ml('القسم الأول'), body: ml('<p>نص</p>') },
                            ],
                        },
                    });
                }
                return Promise.resolve({
                    type: where.type,
                    data: {
                        hero: { title: ml('عنوان الصفحة') },
                        statement: ml('بيان الصفحة'),
                    },
                });
            }),
        },
        seo: {
            findUnique: jest.fn().mockResolvedValue({
                pageKey: 'home',
                title: ml('عنوان SEO'),
                description: ml('وصف SEO'),
            }),
        },
        service: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        sector: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        news: {
            findMany: jest.fn().mockResolvedValue([]),
            count: jest.fn().mockResolvedValue(0),
        },
        articleCategory: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        job: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        jobDepartment: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        office: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        clientLogo: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        credential: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        testimonial: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        faqItem: {
            findMany: jest.fn().mockResolvedValue([]),
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

    it('GET /api/site/chrome returns valid SiteChromeWebSchema', async () => {
        const res = await fetch(`${baseUrl}/api/site/chrome`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(SiteChromeWebSchema.safeParse(body).success).toBe(true);
    });

    it('GET /api/pages/home returns valid HomePageWebSchema', async () => {
        const res = await fetch(`${baseUrl}/api/pages/home`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(HomePageWebSchema.safeParse(body).success).toBe(true);
    });

    it('GET /api/pages/about returns valid AboutPageWebSchema', async () => {
        const res = await fetch(`${baseUrl}/api/pages/about`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(AboutPageWebSchema.safeParse(body).success).toBe(true);
    });

    it('GET /api/pages/services returns valid ServicesPageWebSchema', async () => {
        const res = await fetch(`${baseUrl}/api/pages/services`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(ServicesPageWebSchema.safeParse(body).success).toBe(true);
    });

    it('GET /api/pages/sectors returns valid SectorsPageWebSchema', async () => {
        const res = await fetch(`${baseUrl}/api/pages/sectors`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(SectorsPageWebSchema.safeParse(body).success).toBe(true);
    });

    it('GET /api/pages/articles returns valid ArticlesPageWebSchema', async () => {
        const res = await fetch(`${baseUrl}/api/pages/articles`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(ArticlesPageWebSchema.safeParse(body).success).toBe(true);
    });

    it('GET /api/pages/careers returns valid CareersPageWebSchema', async () => {
        const res = await fetch(`${baseUrl}/api/pages/careers`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(CareersPageWebSchema.safeParse(body).success).toBe(true);
    });

    it('GET /api/pages/contact returns valid ContactPageWebSchema', async () => {
        const res = await fetch(`${baseUrl}/api/pages/contact`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(ContactPageWebSchema.safeParse(body).success).toBe(true);
    });

    it('GET /api/pages/legal/:key returns valid LegalPageWebSchema for privacy, terms, accessibility', async () => {
        for (const key of ['privacy', 'terms', 'accessibility']) {
            const res = await fetch(`${baseUrl}/api/pages/legal/${key}`);
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(LegalPageWebSchema.safeParse(body).success).toBe(true);
        }
    });

    it('GET /api/pages/legal/invalid returns 404', async () => {
        const res = await fetch(`${baseUrl}/api/pages/legal/invalid`);
        expect(res.status).toBe(404);
    });
});
