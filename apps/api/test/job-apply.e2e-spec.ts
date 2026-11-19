import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { ResourceService } from '@/resource/resource.service';

describe('Job Application Submission (E2E)', () => {
    let app: INestApplication;
    const createdApplications: any[] = [];
    const createdConsents: any[] = [];
    const createdOutbox: any[] = [];

    const openJob = {
        id: 'job-open-1',
        slug: 'senior-auditor',
        isPublished: true,
        isDeleted: false,
        closesAt: new Date(Date.now() + 86_400_000),
        translations: [{ language: 'ar', title: 'مراجع أول' }],
    };

    const closedJob = {
        id: 'job-closed-1',
        slug: 'closed-role',
        isPublished: true,
        isDeleted: false,
        closesAt: new Date(Date.now() - 86_400_000),
        translations: [{ language: 'ar', title: 'وظيفة مغلقة' }],
    };

    const mockPrisma = {
        $transaction: jest.fn().mockImplementation(async (fn: any) => fn(mockPrisma)),
        job: {
            findFirst: jest.fn().mockImplementation(({ where }: any) => {
                if (where.slug === 'senior-auditor' || where.id === 'job-open-1') {
                    return Promise.resolve(openJob);
                }
                if (where.slug === 'closed-role' || where.id === 'job-closed-1') {
                    return Promise.resolve(closedJob);
                }
                return Promise.resolve(null);
            }),
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
                if (where.slug === 'senior-auditor' || where.id === 'job-open-1') {
                    return Promise.resolve(openJob);
                }
                if (where.slug === 'closed-role' || where.id === 'job-closed-1') {
                    return Promise.resolve(closedJob);
                }
                return Promise.resolve(null);
            }),
        },
        jobApplication: {
            create: jest.fn().mockImplementation(({ data }: any) => {
                const row = { id: `app-${createdApplications.length + 1}`, ...data };
                createdApplications.push(row);
                return Promise.resolve(row);
            }),
        },
        consentRecord: {
            create: jest.fn().mockImplementation(({ data }: any) => {
                const row = { id: `consent-${createdConsents.length + 1}`, ...data };
                createdConsents.push(row);
                return Promise.resolve(row);
            }),
        },
        emailOutbox: {
            create: jest.fn().mockImplementation(({ data }: any) => {
                const row = { id: `out-${createdOutbox.length + 1}`, ...data };
                createdOutbox.push(row);
                return Promise.resolve(row);
            }),
        },
        section: {
            findUnique: jest.fn().mockResolvedValue(null),
        },
    };

    const mockResourceService = {
        uploadFile: jest.fn().mockResolvedValue('private/resumes/cv-123.pdf'),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrisma)
            .overrideProvider(ResourceService)
            .useValue(mockResourceService)
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
        createdApplications.length = 0;
        createdConsents.length = 0;
        createdOutbox.length = 0;
    });

    it('POST /api/jobs/:slug/apply accepts valid PDF resume and stores private key, consent, and outbox rows', async () => {
        const pdfBuf = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n');

        const res = await request(app.getHttpServer())
            .post('/api/jobs/senior-auditor/apply')
            .field('fullName', 'سارة الحربي')
            .field('email', 'sara@example.com')
            .field('mobile', '0501122334')
            .field('linkedinUrl', 'https://linkedin.com/in/sara')
            .field('motivation', 'خبرة 5 سنوات في المراجعة الخارجية')
            .field('consent', 'true')
            .field('website', '')
            .field('startedAt', String(Date.now() - 10_000))
            .attach('resume', pdfBuf, 'cv.pdf')
            .expect(201);

        expect(res.body.ok).toBe(true);
        expect(createdApplications).toHaveLength(1);
        expect(createdApplications[0].resumeKey).toBe('private/resumes/cv-123.pdf');
        expect(createdApplications[0].mobile).toBe('+966501122334');
        expect(createdConsents).toHaveLength(1);
        expect(createdOutbox).toHaveLength(2);
    });

    it('rejects wrong file magic bytes with 415 Unsupported Media Type', async () => {
        const badBuf = Buffer.from('MZ-fake-executable-content');

        await request(app.getHttpServer())
            .post('/api/jobs/senior-auditor/apply')
            .field('fullName', 'سارة الحربي')
            .field('email', 'sara@example.com')
            .field('mobile', '0501122334')
            .field('consent', 'true')
            .field('website', '')
            .field('startedAt', String(Date.now() - 10_000))
            .attach('resume', badBuf, 'cv.pdf')
            .expect(415);

        expect(createdApplications).toHaveLength(0);
    });

    it('rejects closed job with 409 Conflict', async () => {
        const pdfBuf = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n');

        await request(app.getHttpServer())
            .post('/api/jobs/closed-role/apply')
            .field('fullName', 'سارة الحربي')
            .field('email', 'sara@example.com')
            .field('mobile', '0501122334')
            .field('consent', 'true')
            .field('website', '')
            .field('startedAt', String(Date.now() - 10_000))
            .attach('resume', pdfBuf, 'cv.pdf')
            .expect(409);

        expect(createdApplications).toHaveLength(0);
    });
});
