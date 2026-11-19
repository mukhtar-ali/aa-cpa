import { BadRequestException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { ConsentService } from '@/privacy/consent.service';
import { OutboxService } from '@/outbox/outbox.service';

describe('LeadsService', () => {
    let service: LeadsService;
    let prisma: any;
    let consentService: ConsentService;
    let outboxService: OutboxService;

    beforeEach(() => {
        prisma = {
            $transaction: jest.fn().mockImplementation(async (fn: any) => fn(prisma)),
            section: {
                findUnique: jest.fn().mockImplementation(({ where }: any) => {
                    if (where.type === 'notification-settings') {
                        return Promise.resolve({
                            type: 'notification-settings',
                            data: {
                                defaultInbox: 'info@cpa.sa',
                                serviceRecipients: {
                                    'srv-zakat': ['zakat@cpa.sa', 'partner@cpa.sa'],
                                },
                                careersInbox: 'careers@cpa.sa',
                                retentionMonths: 12,
                            },
                        });
                    }
                    if (where.type === 'legal-privacy') {
                        return Promise.resolve({
                            type: 'legal-privacy',
                            data: { version: '1.2' },
                        });
                    }
                    return Promise.resolve(null);
                }),
            },
            contact: {
                create: jest.fn().mockImplementation(({ data }: any) =>
                    Promise.resolve({ id: 'lead-1', createdAt: new Date(), updatedAt: new Date(), ...data }),
                ),
                findMany: jest.fn().mockResolvedValue([]),
                count: jest.fn().mockResolvedValue(0),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            consentRecord: {
                create: jest.fn().mockImplementation(({ data }: any) =>
                    Promise.resolve({ id: 'consent-1', ...data }),
                ),
                findFirst: jest.fn().mockResolvedValue(null),
            },
            emailOutbox: {
                create: jest.fn().mockImplementation(({ data }: any) =>
                    Promise.resolve({ id: 'out-1', ...data }),
                ),
            },
        };

        consentService = new ConsentService(prisma);
        outboxService = new OutboxService(prisma);
        service = new LeadsService(prisma, consentService, outboxService);
    });

    it('creates a contact lead, consent record, and outbox emails in one transaction and normalizes Saudi mobile', async () => {
        const startedAt = new Date(Date.now() - 10_000).toISOString();
        const res = await service.submitContact(
            {
                fullName: 'عبدالله القحطاني',
                company: 'شركة البناء',
                mobile: '0551234567',
                email: 'abdullah@example.com',
                serviceId: 'srv-zakat',
                message: 'نرغب في عرض سعر لخدمات الزكاة والضريبة لعام 2026',
                landingPath: '/ar/contact',
                consent: true,
                website: '',
                startedAt,
            },
            { lang: 'ar', ip: '1.2.3.4', userAgent: 'Jest' },
        );

        expect(res).toEqual({ ok: true, success: true, id: 'lead-1' });
        expect(prisma.contact.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                fullName: 'عبدالله القحطاني',
                mobile: '+966551234567',
                email: 'abdullah@example.com',
                serviceId: 'srv-zakat',
                source: 'contact',
                status: 'new',
                language: 'ar',
            }),
        });
        expect(prisma.consentRecord.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                subjectType: 'contact',
                subjectId: 'lead-1',
                policyVersion: '1.2',
            }),
        });
        // 2 staff recipients for srv-zakat + 1 client ack = 3 outbox emails
        expect(prisma.emailOutbox.create).toHaveBeenCalledTimes(3);
    });

    it('rejects invalid payload with BadRequestException', async () => {
        await expect(
            service.submitContact(
                {
                    fullName: '',
                    mobile: 'invalid',
                    email: 'not-an-email',
                    message: 'short',
                    consent: true,
                    website: '',
                    startedAt: new Date(Date.now() - 10_000).toISOString(),
                } as any,
                { lang: 'ar' },
            ),
        ).rejects.toThrow(BadRequestException);
    });
});
