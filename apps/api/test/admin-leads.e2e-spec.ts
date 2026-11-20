import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionEnum } from '@repo/shared';

describe('Admin Leads Management (E2E)', () => {
    let app: INestApplication;

    const leadRow: any = {
        id: 'lead-100',
        fullName: '=cmd|\' /C calc\'!A0', // Formula injection test payload
        company: 'شركة التطوير',
        mobile: '+966501112223',
        email: 'lead@example.com',
        source: 'contact',
        status: 'new',
        assignedToId: null,
        notes: [],
        language: 'ar',
        isDeleted: false,
        createdAt: new Date('2026-11-19T10:00:00Z'),
        updatedAt: new Date('2026-11-19T10:00:00Z'),
    };

    const mockPrisma = {
        $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrisma)),
        $queryRaw: jest.fn().mockResolvedValue([]),
        contact: {
            findMany: jest.fn().mockResolvedValue([leadRow]),
            count: jest.fn().mockResolvedValue(1),
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
                if (where.id === 'lead-100') return Promise.resolve(leadRow);
                return Promise.resolve(null);
            }),
            update: jest.fn().mockImplementation(({ data }: any) => {
                Object.assign(leadRow, data);
                return Promise.resolve(leadRow);
            }),
        },
        consentRecord: {
            findFirst: jest.fn().mockResolvedValue({
                ipHash: 'a'.repeat(64),
                policyVersion: '1.0',
                consentedAt: new Date('2026-11-19T10:00:00Z'),
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
                            PermissionEnum.AdminPortalLeadsView,
                            PermissionEnum.AdminPortalLeadsUpdate,
                            PermissionEnum.AdminPortalLeadsExport,
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

    it('GET /api/admin/leads lists leads with filters', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/admin/leads?status=new')
            .expect(200);
        expect(res.body.items).toHaveLength(1);
    });

    it('GET /api/admin/leads/:id returns lead detail with consent record', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/admin/leads/lead-100')
            .expect(200);
        expect(res.body.consentRecord).toBeDefined();
        expect(res.body.consentRecord.policyVersion).toBe('1.0');
    });

    it('PATCH /api/admin/leads/:id updates status and assignment, rejecting invalid statuses', async () => {
        await request(app.getHttpServer())
            .patch('/api/admin/leads/lead-100')
            .send({ status: 'invalid_status' })
            .expect(400);

        const res = await request(app.getHttpServer())
            .patch('/api/admin/leads/lead-100')
            .send({ status: 'contacted', assignedToId: 'user-2' })
            .expect(200);

        expect(res.body.status).toBe('contacted');
        expect(res.body.assignedToId).toBe('user-2');
    });

    it('POST /api/admin/leads/:id/notes appends timestamped note', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/admin/leads/lead-100/notes')
            .send({ body: 'تم الاتصال بالعميل وتحديد موعد' })
            .expect(201);

        expect(res.body.notes).toHaveLength(1);
        expect(res.body.notes[0].body).toBe('تم الاتصال بالعميل وتحديد موعد');
    });

    it('GET /api/admin/leads/export.csv returns UTF-8 BOM and escapes formula injection payloads', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/admin/leads/export.csv')
            .expect(200);

        expect(res.text.charCodeAt(0)).toBe(0xfeff);
        // Formula injection payload starting with '=' is prefixed with single quote
        expect(res.text).toContain("'=cmd|");
    });
});
