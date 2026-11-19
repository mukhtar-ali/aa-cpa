import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { DEFAULT_ESTIMATOR_CONFIG } from '@/estimator/calculator';
import { EstimatorPublicSchema } from '@repo/shared';

describe('Fee Estimator (E2E)', () => {
    let app: INestApplication;
    let currentEstimatorConfig: any = { ...DEFAULT_ESTIMATOR_CONFIG, status: 'draft' };
    const monitoringEvents: any[] = [];
    const createdLeads: any[] = [];

    const mockPrisma = {
        $transaction: jest.fn().mockImplementation(async (fn: any) => fn(mockPrisma)),
        section: {
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
                if (where.type === 'estimator-config') {
                    return Promise.resolve({
                        type: 'estimator-config',
                        data: currentEstimatorConfig,
                    });
                }
                if (where.type === 'notification-settings') {
                    return Promise.resolve({
                        type: 'notification-settings',
                        data: { defaultInbox: 'info@cpa.sa' },
                    });
                }
                if (where.type === 'spam-settings') {
                    return Promise.resolve({
                        type: 'spam-settings',
                        data: { turnstileEnabled: false, minFillSeconds: 3 },
                    });
                }
                return Promise.resolve(null);
            }),
        },
        monitoringEvent: {
            create: jest.fn().mockImplementation(({ data }: any) => {
                monitoringEvents.push(data);
                return Promise.resolve({ id: 'evt-1', ...data });
            }),
        },
        contact: {
            create: jest.fn().mockImplementation(({ data }: any) => {
                const row = { id: 'lead-quote-1', ...data };
                createdLeads.push(row);
                return Promise.resolve(row);
            }),
        },
        consentRecord: {
            create: jest.fn().mockResolvedValue({ id: 'consent-1' }),
        },
        emailOutbox: {
            create: jest.fn().mockResolvedValue({ id: 'out-1' }),
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
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    beforeEach(() => {
        monitoringEvents.length = 0;
        createdLeads.length = 0;
    });

    it('returns 404 when estimator config status is draft', async () => {
        currentEstimatorConfig = { ...DEFAULT_ESTIMATOR_CONFIG, status: 'draft' };
        await request(app.getHttpServer()).get('/api/estimator').expect(404);
        await request(app.getHttpServer())
            .post('/api/estimator/estimate')
            .send({ answers: { service: 'external-audit' } })
            .expect(404);
    });

    it('returns public questions without pricing factors when status is approved', async () => {
        currentEstimatorConfig = { ...DEFAULT_ESTIMATOR_CONFIG, status: 'approved' };
        const res = await request(app.getHttpServer()).get('/api/estimator').expect(200);
        expect(EstimatorPublicSchema.safeParse(res.body).success).toBe(true);
        expect(res.body.pricing).toBeUndefined();
        for (const q of res.body.questions) {
            for (const opt of q.options) {
                expect(opt.factor).toBeUndefined();
            }
        }
    });

    it('calculates estimate and records anonymous monitoring event without PII or inputs', async () => {
        currentEstimatorConfig = { ...DEFAULT_ESTIMATOR_CONFIG, status: 'approved' };
        const res = await request(app.getHttpServer())
            .post('/api/estimator/estimate')
            .send({
                answers: {
                    service: 'external-audit',
                    revenue: 'under-5m',
                    entities: '1',
                    books: 'monthly',
                },
            })
            .expect(200);

        expect(res.body).toMatchObject({
            min: 21500,
            max: 29000,
            currency: 'SAR',
            isDraft: false,
        });
        expect(monitoringEvents).toHaveLength(1);
        expect(monitoringEvents[0].name).toBe('estimator.completed');
        expect(JSON.stringify(monitoringEvents[0])).not.toContain('external-audit');
    });

    it('reflects config pricing changes immediately on next estimate', async () => {
        currentEstimatorConfig = {
            ...DEFAULT_ESTIMATOR_CONFIG,
            status: 'approved',
            pricing: {
                ...DEFAULT_ESTIMATOR_CONFIG.pricing,
                serviceBases: {
                    ...DEFAULT_ESTIMATOR_CONFIG.pricing.serviceBases,
                    'external-audit': 50000,
                },
            },
        };

        const res = await request(app.getHttpServer())
            .post('/api/estimator/estimate')
            .send({
                answers: {
                    service: 'external-audit',
                    revenue: 'under-5m',
                    entities: '1',
                    books: 'monthly',
                },
            })
            .expect(200);

        expect(res.body.min).toBe(42500);
        expect(res.body.max).toBe(57500);
    });

    it('POST /api/estimator/quote creates a lead with source=estimator, answers, and range', async () => {
        currentEstimatorConfig = { ...DEFAULT_ESTIMATOR_CONFIG, status: 'approved' };
        const res = await request(app.getHttpServer())
            .post('/api/estimator/quote')
            .send({
                answers: {
                    service: 'external-audit',
                    revenue: 'under-5m',
                    entities: '1',
                    books: 'monthly',
                },
                range: { min: 21500, max: 29000, currency: 'SAR' },
                fullName: 'فهد الدوسري',
                company: 'شركة الدوسري',
                mobile: '0559876543',
                email: 'fahad@example.com',
                consent: true,
                website: '',
                startedAt: new Date(Date.now() - 10_000).toISOString(),
            })
            .expect(201);

        expect(res.body.ok).toBe(true);
        expect(createdLeads).toHaveLength(1);
        expect(createdLeads[0].source).toBe('estimator');
        expect(createdLeads[0].estimatedRange).toEqual({
            min: 21500,
            max: 29000,
            currency: 'SAR',
        });
    });
});
