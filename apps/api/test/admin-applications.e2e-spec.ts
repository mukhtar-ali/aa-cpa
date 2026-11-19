import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionEnum } from '@repo/shared';

describe('Admin Job Applications Management (E2E)', () => {
    let app: INestApplication;

    const appRow: any = {
        id: 'app-50',
        jobId: 'job-1',
        fullName: '+SUM(1,2)', // Formula injection payload
        email: 'applicant@example.com',
        mobile: '+966550001112',
        linkedinUrl: 'https://linkedin.com/in/applicant',
        resumeKey: 'private/resumes/cv.pdf',
        resumeName: 'cv.pdf',
        resumeSize: 10240,
        status: 'pending',
        notes: [],
        createdAt: new Date('2026-11-19T10:00:00Z'),
        updatedAt: new Date('2026-11-19T10:00:00Z'),
        job: {
            slug: 'senior-auditor',
            translations: [{ language: 'ar', title: 'مراجع أول' }],
        },
    };

    const mockPrisma = {
        jobApplication: {
            findMany: jest.fn().mockResolvedValue([appRow]),
            count: jest.fn().mockResolvedValue(1),
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
                if (where.id === 'app-50') return Promise.resolve(appRow);
                return Promise.resolve(null);
            }),
            update: jest.fn().mockImplementation(({ data }: any) => {
                Object.assign(appRow, data);
                return Promise.resolve(appRow);
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
                        permissions: [
                            PermissionEnum.AdminPortalApplicationsView,
                            PermissionEnum.AdminPortalApplicationsUpdate,
                            PermissionEnum.AdminPortalApplicationsExport,
                        ],
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

    it('enforces valid status transitions (pending -> reviewed -> shortlisted -> interview -> offer -> hired; any -> rejected)', async () => {
        appRow.status = 'pending';

        // Invalid jump pending -> hired
        await request(app.getHttpServer())
            .patch('/api/admin/applications/app-50')
            .send({ status: 'hired' })
            .expect(400);

        // Valid step pending -> reviewed
        const res = await request(app.getHttpServer())
            .patch('/api/admin/applications/app-50')
            .send({ status: 'reviewed' })
            .expect(200);
        expect(res.body.status).toBe('reviewed');
    });

    it('appends note via POST /api/admin/applications/:id/notes', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/admin/applications/app-50/notes')
            .send({ body: 'مرشح ممتاز للمقابلة الفنية' })
            .expect(201);

        expect(res.body.notes).toHaveLength(1);
    });

    it('exports applications CSV with UTF-8 BOM and formula-injection escaping', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/admin/applications/export.csv')
            .expect(200);

        expect(res.text.charCodeAt(0)).toBe(0xfeff);
        expect(res.text).toContain("'+SUM(1,2)");
    });
});
