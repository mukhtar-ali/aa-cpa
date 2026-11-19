import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionEnum } from '@repo/shared';

describe('Admin Outbox Health & Retry (E2E)', () => {
    let app: INestApplication;

    const failedRow: any = {
        id: 'out-failed-1',
        kind: 'email',
        template: 'lead-staff',
        to: 'info@cpa.sa',
        status: 'failed',
        attempts: 6,
        lastError: 'SMTP connection refused',
    };

    const mockPrisma = {
        emailOutbox: {
            findMany: jest.fn().mockResolvedValue([failedRow]),
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
                if (where.id === 'out-failed-1') return Promise.resolve(failedRow);
                return Promise.resolve(null);
            }),
            update: jest.fn().mockImplementation(({ data }: any) => {
                Object.assign(failedRow, data);
                return Promise.resolve(failedRow);
            }),
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
                        permissions: [PermissionEnum.AdminPortalSettingsNotifications],
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

    it('GET /api/admin/outbox?status=failed lists failed outbox deliveries', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/admin/outbox?status=failed')
            .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('out-failed-1');
    });

    it('POST /api/admin/outbox/:id/retry resets status to pending and attempts to 0', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/admin/outbox/out-failed-1/retry')
            .expect(201);

        expect(res.body.status).toBe('pending');
        expect(res.body.attempts).toBe(0);
        expect(res.body.lastError).toBeNull();
    });
});
