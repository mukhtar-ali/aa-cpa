import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
    LeadQuerySchema,
    LeadSourceSchema,
    LeadStatusSchema,
} from '@repo/shared';
import { LeadsService, escapeCsvCell } from './leads.service';
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
            $queryRaw: jest.fn().mockResolvedValue([]),
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

    describe('Fix 1 - escapeCsvCell formula guard and phone preservation', () => {
        it('preserves strict international phone numbers without prefixing', () => {
            expect(escapeCsvCell('+966501234567')).toBe('+966501234567');
        });

        it('prefixes values starting with formula trigger characters', () => {
            expect(escapeCsvCell('=SUM(A1)')).toBe("'=SUM(A1)");
            expect(escapeCsvCell('@x')).toBe("'@x");
            expect(escapeCsvCell('-1+2')).toBe("'-1+2");
            expect(escapeCsvCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
            expect(escapeCsvCell('+12')).toBe("'+12");
        });

        it('handles null, undefined, and object cases', () => {
            expect(escapeCsvCell(null)).toBe('');
            expect(escapeCsvCell(undefined)).toBe('');
            expect(escapeCsvCell({ a: 1 })).toBe('"{""a"":1}"');
        });

        it('quotes cells containing commas, quotes, or newlines', () => {
            expect(escapeCsvCell('hello,world')).toBe('"hello,world"');
            expect(escapeCsvCell('hello"world')).toBe('"hello""world"');
            expect(escapeCsvCell('hello\nworld')).toBe('"hello\nworld"');
            expect(escapeCsvCell('+966501234567, extra')).toBe("\"'+966501234567, extra\"");
        });
    });

    describe('Fix 2 - buildAdminWhere validation in listAdmin and exportCsvAdmin', () => {
        it('throws BadRequestException on invalid status in listAdmin', async () => {
            await expect(service.listAdmin({ status: 'invalid_status' })).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException on invalid source in listAdmin', async () => {
            await expect(service.listAdmin({ source: 'invalid_source' })).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException on invalid from date in listAdmin', async () => {
            await expect(service.listAdmin({ from: 'not-a-date' })).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException on invalid to date in listAdmin', async () => {
            await expect(service.listAdmin({ to: 'invalid-date' })).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException on invalid status in exportCsvAdmin', async () => {
            await expect(service.exportCsvAdmin({ status: 'invalid_status' })).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException on invalid source in exportCsvAdmin', async () => {
            await expect(service.exportCsvAdmin({ source: 'invalid_source' })).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException on invalid from date in exportCsvAdmin', async () => {
            await expect(service.exportCsvAdmin({ from: 'not-a-date' })).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException on invalid to date in exportCsvAdmin', async () => {
            await expect(service.exportCsvAdmin({ to: 'invalid-date' })).rejects.toThrow(BadRequestException);
        });

        it('builds { in: [...] } for valid CSV status=NEW,CONTACTED', async () => {
            await service.listAdmin({ status: 'NEW,CONTACTED' });
            expect(prisma.contact.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: { in: ['new', 'contacted'] },
                    }),
                }),
            );
        });

        it('builds { in: [...] } for valid CSV status=new,contacted', async () => {
            await service.listAdmin({ status: 'new,contacted' });
            expect(prisma.contact.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: { in: ['new', 'contacted'] },
                    }),
                }),
            );
        });
    });

    describe('Fix 3 - addNoteAdmin row lock, isolation, and note appending', () => {
        it('persists two sequential notes where second sees the first note via the tx mock', async () => {
            const contactRecord: any = {
                id: 'lead-1',
                notes: [],
                isDeleted: false,
            };

            prisma.contact.findUnique = jest.fn().mockImplementation(async () => ({ ...contactRecord }));
            prisma.contact.update = jest.fn().mockImplementation(async ({ data }: any) => {
                contactRecord.notes = data.notes;
                return { ...contactRecord };
            });

            const res1 = await service.addNoteAdmin('lead-1', 'admin-1', 'First note');
            expect(res1.notes).toHaveLength(1);
            expect(res1.notes[0]).toMatchObject({
                authorId: 'admin-1',
                body: 'First note',
            });

            const res2 = await service.addNoteAdmin('lead-1', 'admin-2', 'Second note');
            expect(res2.notes).toHaveLength(2);
            expect(res2.notes[0]).toMatchObject({
                authorId: 'admin-1',
                body: 'First note',
            });
            expect(res2.notes[1]).toMatchObject({
                authorId: 'admin-2',
                body: 'Second note',
            });
        });

        it('runs the row lock query before updating', async () => {
            const contactRecord: any = {
                id: 'lead-1',
                notes: [],
                isDeleted: false,
            };
            prisma.contact.findUnique = jest.fn().mockImplementation(async () => ({ ...contactRecord }));
            prisma.contact.update = jest.fn().mockImplementation(async ({ data }: any) => {
                contactRecord.notes = data.notes;
                return { ...contactRecord };
            });

            await service.addNoteAdmin('lead-1', 'admin-1', 'Test lock');

            expect(prisma.$queryRaw).toHaveBeenCalled();
            const lockCallOrder = (prisma.$queryRaw as jest.Mock).mock.invocationCallOrder[0];
            const updateCallOrder = (prisma.contact.update as jest.Mock).mock.invocationCallOrder[0];
            expect(lockCallOrder).toBeLessThan(updateCallOrder);
        });

        it('throws NotFoundException when lead is not found or isDeleted', async () => {
            prisma.contact.findUnique = jest.fn().mockResolvedValue(null);
            await expect(service.addNoteAdmin('non-existent', 'admin-1', 'Note')).rejects.toThrow(NotFoundException);

            prisma.contact.findUnique = jest.fn().mockResolvedValue({ id: 'lead-del', isDeleted: true });
            await expect(service.addNoteAdmin('lead-del', 'admin-1', 'Note')).rejects.toThrow(NotFoundException);
        });

        it('throws BadRequestException when note body is empty or whitespace only', async () => {
            await expect(service.addNoteAdmin('lead-1', 'admin-1', '')).rejects.toThrow(BadRequestException);
            await expect(service.addNoteAdmin('lead-1', 'admin-1', '   ')).rejects.toThrow(BadRequestException);
        });
    });

    describe('Scope case-insensitivity to admin query only', () => {
        it('rejects uppercase status in LeadStatusSchema.safeParse', () => {
            expect(LeadStatusSchema.safeParse('NEW').success).toBe(false);
            expect(LeadStatusSchema.safeParse('new').success).toBe(true);
        });

        it('rejects uppercase source in LeadSourceSchema.safeParse', () => {
            expect(LeadSourceSchema.safeParse('CONTACT').success).toBe(false);
            expect(LeadSourceSchema.safeParse('contact').success).toBe(true);
        });

        it('accepts case-insensitive status and source in LeadQuerySchema', () => {
            const parsed = LeadQuerySchema.parse({
                status: 'NEW,contacted',
                source: 'CONTACT,estimator',
            });
            expect(parsed.status).toEqual(['new', 'contacted']);
            expect(parsed.source).toEqual(['contact', 'estimator']);
        });

        it('rejects uppercase status in updateAdmin write path', async () => {
            await expect(service.updateAdmin('lead-1', { status: 'NEW' })).rejects.toThrow(BadRequestException);
        });
    });

    describe('assignedTo select uses username instead of name', () => {
        it('selects username on assignedTo in listAdmin', async () => {
            await service.listAdmin({});
            expect(prisma.contact.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining({
                        assignedTo: { select: { id: true, username: true, email: true } },
                    }),
                }),
            );
        });

        it('selects username on assignedTo in getByIdAdmin', async () => {
            prisma.contact.findUnique = jest.fn().mockResolvedValue({
                id: 'lead-1',
                notes: [],
                isDeleted: false,
            });
            await service.getByIdAdmin('lead-1');
            expect(prisma.contact.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'lead-1' },
                    include: expect.objectContaining({
                        assignedTo: { select: { id: true, username: true, email: true } },
                    }),
                }),
            );
        });

        it('selects username on assignedTo in exportCsvAdmin', async () => {
            await service.exportCsvAdmin({});
            expect(prisma.contact.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining({
                        assignedTo: { select: { id: true, username: true } },
                    }),
                }),
            );
        });
    });
});
