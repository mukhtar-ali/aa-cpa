import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionEnum } from '@repo/shared';

describe('Redirects Feature (E2E)', () => {
    let app: INestApplication;

    const mockRedirectDb: any[] = [
        {
            id: 'red-1',
            fromPath: '/old-about',
            toPath: '/ar/about',
            type: 'permanent',
            source: 'manual',
            hits: 12,
            lastHitAt: new Date('2026-11-20T10:00:00Z'),
            createdById: 'admin-1',
            createdAt: new Date('2026-11-19T10:00:00Z'),
            updatedAt: new Date('2026-11-19T10:00:00Z'),
            createdBy: {
                id: 'admin-1',
                fullName: 'Super Admin',
                email: 'admin@example.com',
            },
        },
    ];

    const mockPrisma = {
        $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrisma)),
        redirect: {
            findMany: jest.fn().mockImplementation(({ where }: any = {}) => {
                let res = [...mockRedirectDb];
                if (where?.source) res = res.filter((r) => r.source === where.source);
                if (where?.type) res = res.filter((r) => r.type === where.type);
                return Promise.resolve(res);
            }),
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
                if (where.id) return Promise.resolve(mockRedirectDb.find((r) => r.id === where.id) || null);
                if (where.fromPath) return Promise.resolve(mockRedirectDb.find((r) => r.fromPath === where.fromPath) || null);
                return Promise.resolve(null);
            }),
            findFirst: jest.fn().mockImplementation(({ where }: any) => {
                if (where?.fromPath) return Promise.resolve(mockRedirectDb.find((r) => r.fromPath === where.fromPath) || null);
                return Promise.resolve(null);
            }),
            count: jest.fn().mockImplementation(() => Promise.resolve(mockRedirectDb.length)),
            create: jest.fn().mockImplementation(({ data }: any) => {
                const created = {
                    id: `red-${mockRedirectDb.length + 1}`,
                    hits: 0,
                    lastHitAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ...data,
                };
                mockRedirectDb.push(created);
                return Promise.resolve(created);
            }),
            update: jest.fn().mockImplementation(({ where, data }: any) => {
                const item = mockRedirectDb.find((r) => r.id === where.id);
                if (item) Object.assign(item, data, { updatedAt: new Date() });
                return Promise.resolve(item);
            }),
            updateMany: jest.fn().mockResolvedValue({ count: 0 }),
            delete: jest.fn().mockImplementation(({ where }: any) => {
                const idx = mockRedirectDb.findIndex((r) => r.id === where.id);
                if (idx !== -1) mockRedirectDb.splice(idx, 1);
                return Promise.resolve();
            }),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            upsert: jest.fn().mockImplementation(({ where, create, update }: any) => {
                const existing = mockRedirectDb.find((r) => r.fromPath === where.fromPath);
                if (existing) {
                    Object.assign(existing, update);
                    return Promise.resolve(existing);
                }
                const created = { id: `red-${mockRedirectDb.length + 1}`, ...create };
                mockRedirectDb.push(created);
                return Promise.resolve(created);
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
                            PermissionEnum.AdminPortalSeoView,
                            PermissionEnum.AdminPortalSeoUpdate,
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

    describe('GET /api/redirects/map (Public)', () => {
        it('returns dictionary map and cache-control header', async () => {
            const res = await (request(app.getHttpServer()) as any)
                .get('/api/redirects/map')
                .expect(200);

            expect(res.headers['cache-control']).toContain('public');
            expect(res.body['/old-about']).toEqual({
                to: '/ar/about',
                type: 'permanent',
            });
        });
    });

    describe('Admin CRUD /api/admin/redirects', () => {
        it('lists redirects with pagination metadata', async () => {
            const res = await (request(app.getHttpServer()) as any)
                .get('/api/admin/redirects')
                .expect(200);

            expect(res.body).toHaveProperty('items');
            expect(res.body).toHaveProperty('total');
            expect(Array.isArray(res.body.items)).toBe(true);
        });

        it('creates a new redirect', async () => {
            const res = await (request(app.getHttpServer()) as any)
                .post('/api/admin/redirects')
                .send({
                    fromPath: '/legacy-page',
                    toPath: '/services/audit',
                    type: 'permanent',
                })
                .expect(201);

            expect(res.body.fromPath).toBe('/legacy-page');
            expect(res.body.toPath).toBe('/services/audit');
        });

        it('rejects self-loop on create', async () => {
            const res = await (request(app.getHttpServer()) as any)
                .post('/api/admin/redirects')
                .send({
                    fromPath: '/same-path',
                    toPath: '/same-path',
                    type: 'permanent',
                })
                .expect(400);

            expect(res.body.message).toBeDefined();
        });

        it('updates an existing redirect', async () => {
            const res = await (request(app.getHttpServer()) as any)
                .put('/api/admin/redirects/red-1')
                .send({
                    fromPath: '/old-about',
                    toPath: '/en/about-us',
                    type: 'temporary',
                })
                .expect(200);

            expect(res.body.toPath).toBe('/en/about-us');
            expect(res.body.type).toBe('temporary');
        });

        it('deletes a redirect by ID', async () => {
            await (request(app.getHttpServer()) as any)
                .delete('/api/admin/redirects/red-1')
                .expect(204);
        });
    });

    describe('CSV Import & Export', () => {
        it('exports CSV with columns from,to,type', async () => {
            const res = await (request(app.getHttpServer()) as any)
                .get('/api/admin/redirects/export.csv')
                .expect(200);

            expect(res.headers['content-type']).toContain('text/csv');
            expect(res.headers['content-disposition']).toContain('attachment');
            expect(res.text).toContain('from,to,type');
        });

        it('imports CSV rows successfully', async () => {
            const csv = 'from,to,type\n/import-1,/services/advisory,permanent\n/import-2,/careers,temporary';
            const res = await (request(app.getHttpServer()) as any)
                .post('/api/admin/redirects/import')
                .send({ csv })
                .expect(201);

            expect(res.body.imported).toBe(2);
        });

        it('returns row-level errors for invalid rows', async () => {
            const csv = 'from,to,type\n/valid,/target,permanent\n/loop,/loop,permanent';
            const res = await (request(app.getHttpServer()) as any)
                .post('/api/admin/redirects/import')
                .send({ csv })
                .expect(400);

            expect(res.body).toHaveProperty('errors');
            expect(Array.isArray(res.body.errors)).toBe(true);
        });
    });
});
