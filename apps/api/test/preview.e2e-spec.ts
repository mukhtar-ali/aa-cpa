import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { PreviewService } from '@/preview/preview.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { PermissionEnum } from '@repo/shared';

describe('Preview Token & Draft Access (E2E)', () => {
    let app: INestApplication;
    let previewService: PreviewService;
    let currentUserPermissions: string[] = [];

    const draftService = {
        id: 'srv-draft',
        slug: 'draft-audit',
        isPublished: false,
        isDeleted: false,
        methodology: [],
        deliverables: [],
        sectors: [],
        faqs: [],
        translations: [
            {
                language: 'ar',
                title: 'خدمة مسودة',
                summary: 'ملخص المسودة',
            },
        ],
    };

    const mockPrisma = {
        service: {
            findFirst: jest.fn().mockImplementation(({ where }: any) => {
                if (where.slug === 'draft-audit') {
                    if (where.isPublished === true) {
                        return Promise.resolve(null);
                    }
                    return Promise.resolve(draftService);
                }
                return Promise.resolve(null);
            }),
        },
        redirect: {
            findUnique: jest.fn().mockResolvedValue(null),
            findFirst: jest.fn().mockResolvedValue(null),
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
                    req.user = { id: 'admin-1', permissions: currentUserPermissions };
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        previewService = moduleFixture.get(PreviewService);
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('POST /api/preview/token refuses without manage_content permission', async () => {
        currentUserPermissions = [];
        await request(app.getHttpServer())
            .post('/api/preview/token')
            .send({ kind: 'service', key: 'draft-audit' })
            .expect(403);
    });

    it('POST /api/preview/token issues token when user has manage_content permission', async () => {
        currentUserPermissions = [PermissionEnum.AdminPortalManageContent];
        const res = await request(app.getHttpServer())
            .post('/api/preview/token')
            .send({ kind: 'service', key: 'draft-audit' })
            .expect(201);

        expect(res.body.token).toBeDefined();
        expect(res.body.url).toContain('draft-audit');
    });

    it('GET /api/services/draft-audit with valid token returns draft and Cache-Control: no-store', async () => {
        const { token } = previewService.issueToken({ kind: 'service', key: 'draft-audit' });
        const res = await request(app.getHttpServer())
            .get('/api/services/draft-audit')
            .set('X-Preview-Token', token)
            .expect(200);

        expect(res.headers['cache-control']).toBe('no-store');
        expect(res.body.slug).toBe('draft-audit');
    });

    it('GET /api/services/draft-audit with expired or forged token is treated as anonymous (404 + public cache header)', async () => {
        const { token: expired } = previewService.issueToken(
            { kind: 'service', key: 'draft-audit' },
            -10,
        );
        const res = await request(app.getHttpServer())
            .get('/api/services/draft-audit')
            .set('X-Preview-Token', expired)
            .expect(404);

        expect(res.headers['cache-control']).toContain('public, s-maxage=300');
    });

    it('GET /api/services/draft-audit with token for different scope is treated as anonymous', async () => {
        const { token: wrongScope } = previewService.issueToken({
            kind: 'service',
            key: 'other-service',
        });
        const res = await request(app.getHttpServer())
            .get('/api/services/draft-audit')
            .set('X-Preview-Token', wrongScope)
            .expect(404);

        expect(res.headers['cache-control']).toContain('public, s-maxage=300');
    });
});
