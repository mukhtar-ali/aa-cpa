import { BadRequestException } from '@nestjs/common';
import { PrivacyService } from './privacy.service';
import { ConsentService } from './consent.service';

describe('PrivacyService (PDPL Export, Erase & Retention Job)', () => {
    let service: PrivacyService;
    let consentService: ConsentService;
    let prisma: any;
    let resourceService: any;

    beforeEach(() => {
        prisma = {
            $transaction: jest.fn().mockImplementation(async (fn: any) => fn(prisma)),
            section: {
                findUnique: jest.fn().mockResolvedValue({
                    type: 'notification-settings',
                    data: { retentionMonths: 12 },
                }),
            },
            contact: {
                findMany: jest.fn().mockResolvedValue([{ id: 'lead-1', email: 'subject@example.com' }]),
                deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            jobApplication: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'app-1',
                        email: 'subject@example.com',
                        resumeKey: 'private/resumes/cv-1.pdf',
                    },
                ]),
                deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            consentRecord: {
                findMany: jest.fn().mockResolvedValue([
                    { id: 'c-1', email: 'subject@example.com', subjectId: 'lead-1' },
                    { id: 'c-2', email: 'subject@example.com', subjectId: 'app-1' },
                ]),
                deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
            },
            erasureLog: {
                create: jest.fn().mockImplementation(({ data }: any) =>
                    Promise.resolve({ id: 'erasure-1', ...data }),
                ),
            },
        };

        resourceService = {
            deleteFile: jest.fn().mockResolvedValue(undefined),
        };

        consentService = new ConsentService(prisma);
        service = new PrivacyService(prisma, consentService, resourceService);
    });

    it('exports all leads, job applications, and consent records for an email', async () => {
        const res = await service.exportForEmail('subject@example.com');
        expect(res.email).toBe('subject@example.com');
        expect(res.leads).toHaveLength(1);
        expect(res.applications).toHaveLength(1);
        expect(res.consentRecords).toHaveLength(2);
    });

    it('erases all records and resume files for an email and writes an anonymized ErasureLog without raw email', async () => {
        const res = await service.eraseForEmail('subject@example.com', true, 'admin-1');

        expect(resourceService.deleteFile).toHaveBeenCalledWith('private/resumes/cv-1.pdf');
        expect(prisma.contact.deleteMany).toHaveBeenCalledWith({
            where: { email: 'subject@example.com' },
        });
        expect(prisma.jobApplication.deleteMany).toHaveBeenCalledWith({
            where: { email: 'subject@example.com' },
        });
        expect(prisma.consentRecord.deleteMany).toHaveBeenCalledWith({
            where: { email: 'subject@example.com' },
        });
        expect(prisma.erasureLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                emailHash: expect.stringMatching(/^[a-f0-9]{64}$/),
                requestedById: 'admin-1',
                itemsErased: {
                    leadsCount: 1,
                    applicationsCount: 1,
                    consentRecordsCount: 2,
                    resumesDeletedCount: 1,
                },
            }),
        });
        expect(JSON.stringify(res.erasureLog)).not.toContain('subject@example.com');
    });

    it('rejects erasure when confirm is not true', async () => {
        await expect(
            service.eraseForEmail('subject@example.com', false as any, 'admin-1'),
        ).rejects.toThrow(BadRequestException);
    });

    it('purges expired job applications older than retentionMonths in daily cron job', async () => {
        const count = await service.purgeExpiredApplications();
        expect(count).toBe(1);
        expect(resourceService.deleteFile).toHaveBeenCalledWith('private/resumes/cv-1.pdf');
        expect(prisma.jobApplication.deleteMany).toHaveBeenCalled();
    });
});
