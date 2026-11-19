import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { ResourceService } from '@/resource/resource.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionEnum } from '@repo/shared';

describe('Admin PDPL Privacy Export & Erase (E2E)', () => {
    let app: INestApplication;
    let currentUserPermissions: string[] = [];

    const mockPrisma = {
        $transaction: jest.fn().mockImplementation(async (fn: any) => fn(mockPrisma)),
        contact: {
            findMany: jest.fn().mockResolvedValue([{ id: 'lead-1', email: 'subject@example.com' }]),
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        jobApplication: {
            findMany: jest.fn().mockResolvedValue([
                { id: 'app-1', email: 'subject@example.com', resumeKey: 'private/cv.pdf' },
            ]),
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        consentRecord: {
            findMany: jest.fn().mockResolvedValue([{ id: 'c-1', email: 'subject@example.com' }]),
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        erasureLog: {
            create: jest.fn().mockImplementation(({ data }: any) =>
                Promise.resolve({ id: 'erasure-1', ...data }),
            ),
        },
    };

    const mockResourceService = {
        deleteFile: jest.fn().mockResolvedValue(undefined),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrisma)
            .overrideProvider(ResourceService)
            .useValue(mockResourceService)
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (ctx: any) => {
                    const req = ctx.switchToHttp().getRequest();
                    req.user = { id: 'admin-1', permissions: currentUserPermissions };
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

    it('POST /api/admin/privacy/export returns JSON with leads, applications, and consentRecords', async () => {
        currentUserPermissions = [PermissionEnum.AdminPortalLeadsErase];
        const res = await request(app.getHttpServer())
            .post('/api/admin/privacy/export')
            .send({ email: 'subject@example.com' })
            .expect(200);

        expect(res.body.leads).toHaveLength(1);
        expect(res.body.applications).toHaveLength(1);
        expect(res.body.consentRecords).toHaveLength(1);
    });

    it('POST /api/admin/privacy/erase requires BOTH leads.erase and applications.erase permissions', async () => {
        currentUserPermissions = [PermissionEnum.AdminPortalLeadsErase];
        await request(app.getHttpServer())
            .post('/api/admin/privacy/erase')
            .send({ email: 'subject@example.com', confirm: true })
            .expect(403);

        currentUserPermissions = [
            PermissionEnum.AdminPortalLeadsErase,
            PermissionEnum.AdminPortalApplicationsErase,
        ];
        const res = await request(app.getHttpServer())
            .post('/api/admin/privacy/erase')
            .send({ email: 'subject@example.com', confirm: true })
            .expect(200);

        expect(res.body.ok).toBe(true);
        expect(res.body.erasureLog.emailHash).toHaveLength(64);
    });
});
