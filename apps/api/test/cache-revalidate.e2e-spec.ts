import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionEnum } from '@repo/shared';
import { OutboxWorker } from '@/outbox/outbox.worker';
import { customEnv } from '@/config/custom-env';

describe('Cache Headers & Revalidation Outbox (E2E)', () => {
    let app: INestApplication;
    let outboxWorker: OutboxWorker;
    const outboxRows: any[] = [];

    const mockPrisma = {
        service: {
            findMany: jest.fn().mockResolvedValue([]),
            findUnique: jest.fn().mockResolvedValue({
                id: 'srv-1',
                slug: 'external-audit',
                isPublished: false,
                isDeleted: false,
                translations: [
                    {
                        language: 'ar',
                        title: 'المراجعة الخارجية',
                        summary: 'مراجعة القوائم المالية',
                    },
                ],
            }),
            update: jest.fn().mockResolvedValue({
                id: 'srv-1',
                slug: 'external-audit',
                isPublished: true,
            }),
        },
        emailOutbox: {
            create: jest.fn().mockImplementation(({ data }: any) => {
                outboxRows.push(data);
                return Promise.resolve({ id: `out-${outboxRows.length}`, ...data });
            }),
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
                        permissions: [
                            PermissionEnum.AdminPortalServicesUpdate,
                            PermissionEnum.AdminPortalManageContent,
                        ],
                    };
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        outboxWorker = moduleFixture.get(OutboxWorker);
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('sets Cache-Control: public, s-maxage=300, stale-while-revalidate=86400 on public GET routes', async () => {
        const res = await request(app.getHttpServer()).get('/api/services').expect(200);
        expect(res.headers['cache-control']).toBe(
            'public, s-maxage=300, stale-while-revalidate=86400',
        );
    });

    it('enqueues a revalidate outbox row with affected tags on service publish', async () => {
        outboxRows.length = 0;

        await request(app.getHttpServer())
            .patch('/api/admin/services/srv-1/publish')
            .send({ isPublished: true })
            .expect(200);

        expect(outboxRows.length).toBe(1);
        expect(outboxRows[0].kind).toBe('revalidate');
        expect(outboxRows[0].payload.tags).toEqual(
            expect.arrayContaining([
                'services',
                'service:external-audit',
                'page:home',
                'page:services',
                'site:chrome',
            ]),
        );
    });

    it('posts tags to WEB_REVALIDATE_URL with x-revalidate-secret header', async () => {
        const originalUrl = customEnv.WEB_REVALIDATE_URL;
        const originalSecret = customEnv.WEB_REVALIDATE_SECRET;
        (customEnv as any).WEB_REVALIDATE_URL = 'https://cpa.example.com/api/revalidate';
        (customEnv as any).WEB_REVALIDATE_SECRET = 'test-revalidate-secret';

        const fetchSpy = jest
            .spyOn(global, 'fetch')
            .mockResolvedValue({ ok: true, status: 200 } as Response);

        try {
            await outboxWorker.dispatchRevalidate({
                tags: ['services', 'service:external-audit'],
            });

            expect(fetchSpy).toHaveBeenCalledWith(
                'https://cpa.example.com/api/revalidate',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'x-revalidate-secret': 'test-revalidate-secret',
                    }),
                    body: JSON.stringify({ tags: ['services', 'service:external-audit'] }),
                }),
            );
        } finally {
            fetchSpy.mockRestore();
            (customEnv as any).WEB_REVALIDATE_URL = originalUrl;
            (customEnv as any).WEB_REVALIDATE_SECRET = originalSecret;
        }
    });
});
