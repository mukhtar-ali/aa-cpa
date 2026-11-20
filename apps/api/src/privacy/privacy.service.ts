import {
    BadRequestException,
    Injectable,
    Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { ResourceService } from '@/resource/resource.service';
import { ConsentService } from './consent.service';

@Injectable()
export class PrivacyService {
    private readonly logger = new Logger(PrivacyService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly consentService: ConsentService,
        private readonly resourceService: ResourceService,
    ) {}

    private normalizeEmail(email: string): string {
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            throw new BadRequestException('A valid email address is required');
        }
        return email.trim().toLowerCase();
    }

    async exportForEmail(rawEmail: string) {
        const email = this.normalizeEmail(rawEmail);

        const [leads, applications, consentRecords] = await Promise.all([
            this.prisma.contact.findMany({ where: { email } }),
            this.prisma.jobApplication.findMany({ where: { email } }),
            this.prisma.consentRecord.findMany({ where: { email } }),
        ]);

        return {
            email,
            exportedAt: new Date().toISOString(),
            leads,
            applications,
            consentRecords,
        };
    }

    async eraseForEmail(
        rawEmail: string,
        confirm: boolean,
        requestedById: string,
    ) {
        const email = this.normalizeEmail(rawEmail);
        if (confirm !== true) {
            throw new BadRequestException('Explicit confirmation (confirm: true) is required for PDPL erasure');
        }

        const applications = await this.prisma.jobApplication.findMany({
            where: { email },
        });

        let resumesDeletedCount = 0;
        for (const app of applications) {
            if (app.resumeKey) {
                try {
                    await this.resourceService.deleteObject(app.resumeKey);
                    resumesDeletedCount++;
                } catch (err) {
                    this.logger.warn(
                        `Could not delete resume file ${app.resumeKey} during PDPL erasure: ${(err as Error).message}`,
                    );
                }
            }
        }

        const emailHash = this.consentService.hashEmail(email);

        const erasureLog = await this.prisma.$transaction(async (tx: any) => {
            const deletedLeads = await tx.contact.deleteMany({ where: { email } });
            const deletedApps = await tx.jobApplication.deleteMany({ where: { email } });
            const deletedConsents = await tx.consentRecord.deleteMany({ where: { email } });

            return tx.erasureLog.create({
                data: {
                    emailHash,
                    requestedById,
                    itemsErased: {
                        leadsCount: deletedLeads.count ?? 0,
                        applicationsCount: deletedApps.count ?? 0,
                        consentRecordsCount: deletedConsents.count ?? 0,
                        resumesDeletedCount,
                    },
                },
            });
        });

        return {
            ok: true,
            erasureLog,
        };
    }

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async purgeExpiredApplications(): Promise<number> {
        const section = await this.prisma.section
            .findUnique({ where: { type: 'notification-settings' } })
            .catch(() => null);
        const retentionMonths =
            Number((section?.data as any)?.retentionMonths) > 0
                ? Number((section?.data as any).retentionMonths)
                : 12;

        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - retentionMonths);

        const expiredApps = await this.prisma.jobApplication.findMany({
            where: {
                createdAt: { lt: cutoff },
            },
        });

        if (expiredApps.length === 0) {
            return 0;
        }

        let resumesDeleted = 0;
        for (const app of expiredApps) {
            if (app.resumeKey) {
                try {
                    await this.resourceService.deleteObject(app.resumeKey);
                    resumesDeleted++;
                } catch {
                    // Ignore missing files
                }
            }
        }

        const appIds = expiredApps.map((a: any) => a.id);

        await this.prisma.$transaction(async (tx: any) => {
            await tx.consentRecord.deleteMany({
                where: {
                    subjectType: 'application',
                    subjectId: { in: appIds },
                },
            });
            await tx.jobApplication.deleteMany({
                where: { id: { in: appIds } },
            });
            await tx.erasureLog.create({
                data: {
                    emailHash: this.consentService.hashEmail(`retention-batch-${cutoff.toISOString()}`),
                    requestedById: 'system-retention',
                    itemsErased: {
                        applicationsCount: expiredApps.length,
                        resumesDeletedCount: resumesDeleted,
                        retentionMonths,
                    },
                },
            });
        });

        return expiredApps.length;
    }
}
