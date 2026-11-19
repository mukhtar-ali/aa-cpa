import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionEnum } from '@repo/shared';

describe('Signed Resume Download & Audit Event (E2E)', () => {
    let app: INestApplication;
    let currentUserPermissions: string[] = [];
    const auditEvents: any[] = [];

    const mockPrisma = {
        jobApplication: {
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
                if (where.id === 'app-123') {
                    return Promise.resolve({
                        id: 'app-123',
                        fullName: 'سارة الحربي',
                        resumeKey: 'private/resumes/cv-123.pdf',
                        resumeName: 'cv.pdf',
                        resumeSize: 12000,
                    });
                }
                return Promise.resolve(null);
            }),
        },
        monitoringEvent: {
            create: jest.fn().mockImplementation(({ data }: any) => {
                auditEvents.push(data);
                return Promise.resolve({ id: 'evt-1', ...data });
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
                    req.user = { id: 'admin-99', permissions: currentUserPermissions };
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    beforeEach(() => {
        auditEvents.length = 0;
    });

    it('refuses resume download without applications.view permission (403)', async () => {
        currentUserPermissions = [];
        await request(app.getHttpServer())
            .get('/api/admin/applications/app-123/resume')
            .expect(403);
        expect(auditEvents).toHaveLength(0);
    });

    it('redirects (302) to a 5-minute signed download URL and writes a cv.download audit event', async () => {
        currentUserPermissions = [PermissionEnum.AdminPortalApplicationsView];
        const res = await request(app.getHttpServer())
            .get('/api/admin/applications/app-123/resume')
            .expect(302);

        const location = res.headers['location'];
        expect(location).toContain('/api/admin/applications/app-123/resume/file?token=');
        expect(auditEvents).toHaveLength(1);
        expect(auditEvents[0].name).toBe('cv.download');
        expect(auditEvents[0].props).toMatchObject({
            applicationId: 'app-123',
            adminId: 'admin-99',
        });
    });
});
