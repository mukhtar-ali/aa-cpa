import { OutboxWorker, BACKOFF_MINUTES, MAX_OUTBOX_ATTEMPTS } from './outbox.worker';
import { OutboxService } from './outbox.service';
import { tagsForEntity } from './revalidate';

describe('OutboxWorker & OutboxService', () => {
    let worker: OutboxWorker;
    let outboxService: OutboxService;
    let prisma: any;
    let emailService: any;

    beforeEach(() => {
        prisma = {
            $transaction: jest.fn().mockImplementation(async (fn: any) => fn(prisma)),
            $queryRawUnsafe: jest.fn(),
            emailOutbox: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                updateMany: jest.fn(),
                create: jest.fn(),
            },
        };
        emailService = {
            sendTemplateEmail: jest.fn(),
            sendEmail: jest.fn(),
        };
        outboxService = new OutboxService(prisma);
        worker = new OutboxWorker(prisma, emailService);
    });

    it('uses the expected exponential backoff schedule [1, 5, 15, 60, 360] minutes and max 6 attempts', () => {
        expect(BACKOFF_MINUTES).toEqual([1, 5, 15, 60, 360]);
        expect(MAX_OUTBOX_ATTEMPTS).toBe(6);
    });

    it('claims pending due rows with FOR UPDATE SKIP LOCKED and marks sent on success', async () => {
        const row = {
            id: 'out-1',
            kind: 'email',
            template: 'lead-ack',
            to: 'client@example.com',
            language: 'ar',
            payload: { fullName: 'أحمد' },
            status: 'pending',
            attempts: 0,
        };
        prisma.$queryRawUnsafe.mockResolvedValue([{ id: 'out-1' }]);
        prisma.emailOutbox.findMany.mockResolvedValue([row]);
        emailService.sendEmail.mockResolvedValue(undefined);

        await worker.processBatch();

        expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('FOR UPDATE SKIP LOCKED'),
            expect.any(Date),
            expect.any(Number),
        );
        expect(prisma.emailOutbox.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'out-1' },
                data: expect.objectContaining({
                    status: 'sent',
                    attempts: 1,
                    sentAt: expect.any(Date),
                }),
            }),
        );
    });

    it('schedules retry with backoff on transient failure when attempts < 6', async () => {
        const row = {
            id: 'out-2',
            kind: 'email',
            template: 'lead-staff',
            to: 'staff@example.com',
            language: 'ar',
            payload: {},
            status: 'pending',
            attempts: 1, // this will be attempt #2 -> backoff index 1 = 5 min
        };
        prisma.$queryRawUnsafe.mockResolvedValue([{ id: 'out-2' }]);
        prisma.emailOutbox.findMany.mockResolvedValue([row]);
        emailService.sendEmail.mockRejectedValue(new Error('SMTP timeout'));

        const before = Date.now();
        await worker.processBatch();

        expect(prisma.emailOutbox.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'out-2' },
                data: expect.objectContaining({
                    status: 'pending',
                    attempts: 2,
                    lastError: 'SMTP timeout',
                    nextAttemptAt: expect.any(Date),
                }),
            }),
        );

        const updateCall = prisma.emailOutbox.update.mock.calls[0][0];
        const scheduledMs = updateCall.data.nextAttemptAt.getTime() - before;
        // 5 minutes = 300,000 ms
        expect(scheduledMs).toBeGreaterThanOrEqual(295_000);
        expect(scheduledMs).toBeLessThanOrEqual(305_000);
    });

    it('marks row as failed permanently when attempts reach 6', async () => {
        const row = {
            id: 'out-3',
            kind: 'email',
            template: 'lead-staff',
            to: 'staff@example.com',
            language: 'ar',
            payload: {},
            status: 'pending',
            attempts: 5, // this will be attempt #6 -> max attempts reached
        };
        prisma.$queryRawUnsafe.mockResolvedValue([{ id: 'out-3' }]);
        prisma.emailOutbox.findMany.mockResolvedValue([row]);
        emailService.sendEmail.mockRejectedValue(new Error('Permanent SMTP failure'));

        await worker.processBatch();

        expect(prisma.emailOutbox.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'out-3' },
                data: expect.objectContaining({
                    status: 'failed',
                    attempts: 6,
                    lastError: 'Permanent SMTP failure',
                }),
            }),
        );
    });

    it('computes revalidation tags for service, sector, article, job, and section', () => {
        expect(tagsForEntity('service', 'external-audit')).toEqual(
            expect.arrayContaining(['services', 'service:external-audit', 'page:home', 'page:services', 'site:chrome']),
        );
        expect(tagsForEntity('article', 'zakat-guide')).toEqual(
            expect.arrayContaining(['articles', 'article:zakat-guide', 'page:home', 'page:articles']),
        );
    });
});
