import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Jobs API (E2E)', () => {
    let app: INestApplication;
    let baseUrl: string;

    const mockDepartment = {
        id: 'dept-1',
        slug: 'audit',
        name: { ar: 'المراجعة والتدقيق', en: 'Audit' },
        order: 0,
        isDeleted: false,
    };

    const mockOffice = {
        id: 'off-1',
        city: { ar: 'الرياض', en: 'Riyadh' },
        address: { ar: 'طريق الملك فهد', en: 'King Fahd Road' },
        isPublished: true,
        isDeleted: false,
    };

    const mockJob = {
        id: 'job-1',
        slug: 'senior-auditor',
        departmentId: 'dept-1',
        department: mockDepartment,
        officeId: 'off-1',
        office: mockOffice,
        employmentType: 'full_time',
        experienceMin: 3,
        experienceMax: 5,
        closesAt: new Date(Date.now() + 86400000 * 30),
        responsibilities: [{ ar: 'قيادة المراجعة', en: 'Lead audit' }],
        requirements: [{ ar: 'شهادة SOCPA', en: 'SOCPA' }],
        benefits: [],
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
                jobId: 'job-1',
                language: 'ar',
                title: 'مراجع أول',
                summary: 'انضم لفريق التدقيق',
                body: '<h2>عن الدور</h2><p>تفاصيل الدور هنا</p>',
                location: 'الرياض',
            },
            {
                id: 'tr-2',
                jobId: 'job-1',
                language: 'en',
                title: 'Senior Auditor',
                summary: 'Join the audit team',
                body: '<h2>About the role</h2><p>Role details</p>',
                location: 'Riyadh',
            },
        ],
        applications: [],
    };

    const mockPrisma = {
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        onModuleInit: jest.fn().mockResolvedValue(undefined),
        onModuleDestroy: jest.fn().mockResolvedValue(undefined),
        section: {
            findUnique: jest.fn().mockResolvedValue(null),
        },
        job: {
            findMany: jest.fn().mockResolvedValue([mockJob]),
            findFirst: jest.fn(({ where }: any) => {
                if (where?.slug === 'senior-auditor') return Promise.resolve(mockJob);
                return Promise.resolve(null);
            }),
            findUnique: jest.fn(({ where }: any) => {
                if (where?.id === 'job-1' || where?.slug === 'senior-auditor') return Promise.resolve(mockJob);
                return Promise.resolve(null);
            }),
            count: jest.fn().mockResolvedValue(1),
        },
        jobDepartment: {
            findMany: jest.fn().mockResolvedValue([mockDepartment]),
            findUnique: jest.fn().mockResolvedValue(mockDepartment),
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

    it('GET /api/jobs returns 200 with list of published open jobs', async () => {
        const res = await fetch(`${baseUrl}/api/jobs`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('items');
        expect(Array.isArray(body.items)).toBe(true);
        expect(body.items[0].slug).toBe('senior-auditor');
    });

    it('GET /api/jobs/:slug returns 200 with job details and isOpen=true', async () => {
        const res = await fetch(`${baseUrl}/api/jobs/senior-auditor`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.slug).toBe('senior-auditor');
        expect(body.title).toBe('مراجع أول');
        expect(body.isOpen).toBe(true);
        expect(body.responsibilities).toBeDefined();
    });

    it('GET /api/jobs/:slug returns 404 for non-existent job', async () => {
        const res = await fetch(`${baseUrl}/api/jobs/non-existent-job`);
        expect(res.status).toBe(404);
    });
});
