import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { customEnv } from '@/config/custom-env';

/** Exponential backoff in minutes: 1 min, 5 min, 15 min, 60 min, 6 hours */
export const BACKOFF_MINUTES = [1, 5, 15, 60, 360];
export const MAX_OUTBOX_ATTEMPTS = 6;

@Injectable()
export class OutboxWorker {
    private readonly logger = new Logger(OutboxWorker.name);
    private isProcessing = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) {}

    @Interval(30_000)
    async handleInterval(): Promise<void> {
        if (this.isProcessing) return;
        this.isProcessing = true;
        try {
            await this.processBatch();
        } catch (err) {
            this.logger.error({ err }, 'Outbox batch processing error');
        } finally {
            this.isProcessing = false;
        }
    }

    async processBatch(batchSize = 10): Promise<number> {
        const now = new Date();

        // Claim rows in a transaction using FOR UPDATE SKIP LOCKED
        const claimedRows: any[] = await this.prisma.$transaction(async (tx: any) => {
            const rawIds: { id: string }[] = await tx.$queryRawUnsafe(
                `SELECT id FROM email_outbox WHERE status = 'pending' AND nextAttemptAt <= ? ORDER BY nextAttemptAt ASC LIMIT ? FOR UPDATE SKIP LOCKED`,
                now,
                batchSize,
            );

            if (!rawIds || rawIds.length === 0) {
                return [];
            }

            const ids = rawIds.map((r) => r.id);
            await tx.emailOutbox?.updateMany?.({
                where: { id: { in: ids } },
                data: { status: 'sending' },
            });

            return tx.emailOutbox.findMany({
                where: { id: { in: ids } },
            });
        });

        let processedCount = 0;

        for (const row of claimedRows) {
            processedCount++;
            const attemptNumber = (row.attempts ?? 0) + 1;

            try {
                if (row.kind === 'revalidate') {
                    await this.dispatchRevalidate(row.payload);
                } else {
                    await this.dispatchEmail(row);
                }

                await this.prisma.emailOutbox.update({
                    where: { id: row.id },
                    data: {
                        status: 'sent',
                        attempts: attemptNumber,
                        sentAt: new Date(),
                        lastError: null,
                    },
                });
            } catch (err: any) {
                const errorMessage = err?.message || String(err);
                if (attemptNumber >= MAX_OUTBOX_ATTEMPTS) {
                    await this.prisma.emailOutbox.update({
                        where: { id: row.id },
                        data: {
                            status: 'failed',
                            attempts: attemptNumber,
                            lastError: errorMessage,
                        },
                    });
                } else {
                    const backoffMin =
                        BACKOFF_MINUTES[attemptNumber - 1] ??
                        BACKOFF_MINUTES[BACKOFF_MINUTES.length - 1];
                    const nextAttemptAt = new Date(Date.now() + backoffMin * 60_000);

                    await this.prisma.emailOutbox.update({
                        where: { id: row.id },
                        data: {
                            status: 'pending',
                            attempts: attemptNumber,
                            lastError: errorMessage,
                            nextAttemptAt,
                        },
                    });
                }
            }
        }

        return processedCount;
    }

    private async dispatchEmail(row: any): Promise<void> {
        const langSuffix = String(row.language || 'ar').toLowerCase() === 'en' ? 'en' : 'ar';
        const baseTemplate = String(row.template || 'lead-ack');
        const templateName =
            baseTemplate.endsWith('.ar') || baseTemplate.endsWith('.en')
                ? baseTemplate
                : `${baseTemplate}.${langSuffix}`;

        const payload = (row.payload as Record<string, any>) ?? {};
        const subject =
            payload.subject ||
            (langSuffix === 'en'
                ? 'Notification from Ahmad Abdullah CPA'
                : 'إشعار من مكتب أحمد بن عبدالله للمحاسبة القانونية');

        await this.emailService.sendEmail(row.to, subject, templateName, payload);
    }

    async dispatchRevalidate(payload: any): Promise<void> {
        const url = customEnv.WEB_REVALIDATE_URL;
        if (!url) {
            return;
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-revalidate-secret': customEnv.WEB_REVALIDATE_SECRET || '',
            },
            body: JSON.stringify(payload ?? {}),
        });

        if (!res.ok) {
            throw new Error(`Revalidate failed with HTTP ${res.status}`);
        }
    }
}
