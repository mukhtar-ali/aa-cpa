import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Public Contact Request (E2E)', () => {
    let app: INestApplication;
    const createdLeads: any[] = [];
    const createdConsents: any[] = [];
    const createdOutbox: any[] = [];

    const mockPrisma = {
        $transaction: jest.fn().mockImplementation(async (fn: any) => fn(mockPrisma)),
        section: {
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
                if (where.type === 'notification-settings') {
                    return Promise.resolve({
                        type: 'notification-settings',
                        data: {
                            defaultInbox: 'info@cpa.sa',
                            serviceRecipients: {},
                            careersInbox: 'careers@cpa.sa',
                            retentionMonths: 12,
                        },
                    });
                }
                if (where.type === 'spam-settings') {
                    return Promise.resolve({
                        type: 'spam-settings',
                        data: {
                            turnstileEnabled: false,
                            minFillSeconds: 3,
                        },
                    });
                }
                if (where.type === 'legal-privacy') {
                    return Promise.resolve({
                        type: 'legal-privacy',
                        data: { version: '1.0' },
                    });
                }
                return Promise.resolve(null);
            }),
        },
        contact: {
            create: jest.fn().mockImplementation(({ data }: any) => {
                const row = { id: `lead-${createdLeads.length + 1}`, ...data };
                createdLeads.push(row);
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
        createdLeads.length = 0;
        createdConsents.length = 0;
        createdOutbox.length = 0;
    });

    it('POST /api/contact stores lead, consent record, and outbox rows even when SMTP is down', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/contact')
            .send({
                fullName: 'محمد السالم',
                company: 'شركة السالم للتجارة',
                mobile: '0501234567',
                email: 'salem@example.com',
                message: 'نرجو التواصل بخصوص خدمات المراجعة السنوية للمنشأة',
                consent: true,
                website: '',
                startedAt: new Date(Date.now() - 15_000).toISOString(),
            })
            .expect(201);

        expect(res.body.ok || res.body.success).toBe(true);
        expect(createdLeads).toHaveLength(1);
        expect(createdLeads[0].mobile).toBe('+966501234567');
        expect(createdConsents).toHaveLength(1);
        expect(createdOutbox).toHaveLength(2);
    });

    it('POST /api/contact rejects missing consent or invalid fields with 400', async () => {
        await request(app.getHttpServer())
            .post('/api/contact')
            .send({
                fullName: 'محمد السالم',
                mobile: '0501234567',
                email: 'salem@example.com',
                message: 'نرجو التواصل بخصوص خدمات المراجعة السنوية',
                consent: false,
                website: '',
                startedAt: new Date(Date.now() - 15_000).toISOString(),
            })
            .expect(400);

        expect(createdLeads).toHaveLength(0);
    });

    it('POST /api/contact short-circuits honeypot spam with 201 without storing lead or sending email', async () => {
        await request(app.getHttpServer())
            .post('/api/contact')
            .send({
                fullName: 'Spam Bot',
                mobile: '0501234567',
                email: 'bot@example.com',
                message: 'Buy cheap SEO links today from our website!',
                consent: true,
                website: 'https://spambot.example.com',
                startedAt: new Date(Date.now() - 15_000).toISOString(),
            })
            .expect(201);

        expect(createdLeads).toHaveLength(0);
        expect(createdConsents).toHaveLength(0);
        expect(createdOutbox).toHaveLength(0);
    });

    it('POST /api/contact short-circuits submissions faster than 3s with 201 without side effects', async () => {
        await request(app.getHttpServer())
            .post('/api/contact')
            .send({
                fullName: 'Fast Bot',
                mobile: '0501234567',
                email: 'fast@example.com',
                message: 'Submitted in 100 milliseconds after page load',
                consent: true,
                website: '',
                startedAt: new Date(Date.now() - 500).toISOString(),
            })
            .expect(201);

        expect(createdLeads).toHaveLength(0);
        expect(createdOutbox).toHaveLength(0);
    });
});
