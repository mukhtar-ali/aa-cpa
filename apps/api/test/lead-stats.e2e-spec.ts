import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionEnum } from '@repo/shared';

describe('Admin Lead Stats (E2E)', () => {
    let app: INestApplication;
    let userPermissions: PermissionEnum[] = [PermissionEnum.AdminPortalLeadsView];

    const mockContacts = [
        {
            id: 'c-1',
            source: 'contact',
            serviceId: 'srv-audit',
            landingPath: '/services/audit',
            createdAt: new Date('2026-11-10T10:00:00Z'),
            isDeleted: false,
        },
        {
            id: 'c-2',
            source: 'estimator',
            serviceId: 'srv-tax',
            landingPath: '/estimator',
            createdAt: new Date('2026-11-12T10:00:00Z'),
            isDeleted: false,
        },
        {
            id: 'c-3',
            source: 'contact',
            serviceId: 'srv-audit',
            landingPath: '/services/audit',
            createdAt: new Date('2026-11-15T10:00:00Z'),
            isDeleted: false,
        },
        {
            id: 'c-4',
            source: 'service_page',
            serviceId: null,
            landingPath: '/contact',
            createdAt: new Date('2026-11-18T10:00:00Z'),
            isDeleted: false,
        },
    ];

    const mockServices = [
        {
            id: 'srv-audit',
            slug: 'audit-services',
            translations: [
                { language: 'ar', title: 'خدمات التدقيق' },
                { language: 'en', title: 'Audit Services' },
            ],
        },
        {
            id: 'srv-tax',
            slug: 'tax-consulting',
            translations: [
                { language: 'ar', title: 'الاستشارات الضريبية' },
                { language: 'en', title: 'Tax Consulting' },
            ],
        },
    ];

    const mockEstimatorEvents = [
        { timestamp: new Date('2026-11-10T11:00:00Z') },
        { timestamp: new Date('2026-11-10T15:00:00Z') },
        { timestamp: new Date('2026-11-12T08:00:00Z') },
    ];

    const mockPrisma = {
        contact: {
            findMany: jest.fn().mockImplementation(({ where }: any) => {
                return Promise.resolve(mockContacts);
            }),
        },
        jobApplication: {
            count: jest.fn().mockResolvedValue(2),
        },
        monitoringEvent: {
            findMany: jest.fn().mockResolvedValue(mockEstimatorEvents),
        },
        service: {
            findMany: jest.fn().mockResolvedValue(mockServices),
        },
        section: {
            findUnique: jest.fn().mockResolvedValue(null),
        },
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrisma)
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (ctx: any) => {
                    const req = ctx.switchToHttp().getRequest();
                    req.user = {
                        id: 'admin-1',
                        permissions: userPermissions,
                    };
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) await app.close();
    });

    it('returns 403 Forbidden without admin_portal.leads.view permission', async () => {
        userPermissions = [];
        await (request(app.getHttpServer()) as any)
            .get('/api/dashboard/lead-stats')
            .expect(403);
    });

    it('returns 400 with field errors if invalid date format is provided', async () => {
        userPermissions = [PermissionEnum.AdminPortalLeadsView];
        const res = await (request(app.getHttpServer()) as any)
            .get('/api/dashboard/lead-stats?from=invalid-date')
            .expect(400);

        expect(res.body.statusCode).toBe(400);
        expect(res.body.error || res.body.errors).toBeDefined();
    });

    it('returns 400 with field errors if from > to', async () => {
        userPermissions = [PermissionEnum.AdminPortalLeadsView];
        const res = await (request(app.getHttpServer()) as any)
            .get('/api/dashboard/lead-stats?from=2026-11-25&to=2026-11-20')
            .expect(400);

        expect(res.body.statusCode).toBe(400);
        expect(res.body.error || res.body.errors).toBeDefined();
    });

    it('returns 400 with field errors if date range exceeds 366 days', async () => {
        userPermissions = [PermissionEnum.AdminPortalLeadsView];
        const res = await (request(app.getHttpServer()) as any)
            .get('/api/dashboard/lead-stats?from=2024-01-01&to=2026-01-01')
            .expect(400);

        expect(res.body.statusCode).toBe(400);
        expect(res.body.error || res.body.errors).toBeDefined();
    });

    it('returns 200 and aggregates with default 30-day range', async () => {
        userPermissions = [PermissionEnum.AdminPortalLeadsView];
        const res = await (request(app.getHttpServer()) as any)
            .get('/api/dashboard/lead-stats')
            .expect(200);

        expect(res.body).toHaveProperty('bySource');
        expect(res.body).toHaveProperty('byService');
        expect(res.body).toHaveProperty('byPath');
        expect(res.body).toHaveProperty('estimatorCompletions');

        expect(Array.isArray(res.body.bySource)).toBe(true);
        expect(Array.isArray(res.body.byService)).toBe(true);
        expect(Array.isArray(res.body.byPath)).toBe(true);
        expect(Array.isArray(res.body.estimatorCompletions)).toBe(true);
    });

    it('returns 200 with custom valid date range and resolved service names', async () => {
        userPermissions = [PermissionEnum.AdminPortalLeadsView];
        const res = await (request(app.getHttpServer()) as any)
            .get('/api/dashboard/lead-stats?from=2026-11-01&to=2026-11-24&lang=ar')
            .expect(200);

        expect(res.body.bySource).toEqual(
            expect.arrayContaining([
                { source: 'careers', count: 2 },
                { source: 'contact', count: 2 },
                { source: 'estimator', count: 1 },
                { source: 'service_page', count: 1 },
            ]),
        );

        expect(res.body.byService).toEqual([
            { serviceId: 'srv-audit', name: 'خدمات التدقيق', count: 2 },
            { serviceId: 'srv-tax', name: 'الاستشارات الضريبية', count: 1 },
            { serviceId: null, name: 'عام / أخرى', count: 1 },
        ]);

        expect(res.body.byPath).toEqual([
            { path: '/services/audit', count: 2 },
            { path: '/estimator', count: 1 },
            { path: '/contact', count: 1 },
        ]);

        const nov10 = res.body.estimatorCompletions.find((item: any) => item.date === '2026-11-10');
        expect(nov10?.count).toBe(2);
    });
});
