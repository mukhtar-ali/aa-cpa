import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { JobApplicationSchema } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { ResourceService } from '@/resource/resource.service';
import { ConsentService } from '@/privacy/consent.service';
import { OutboxService } from '@/outbox/outbox.service';
import { escapeCsvCell, normalizeSaudiMobile } from '@/leads/leads.service';
import { customEnv } from '@/config/custom-env';
import { validateResumeFile } from '../helpers/resume-validator';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
    pending: ['reviewed', 'rejected'],
    reviewed: ['shortlisted', 'rejected'],
    shortlisted: ['interview', 'rejected'],
    interview: ['offer', 'rejected'],
    offer: ['hired', 'rejected'],
    hired: ['rejected'],
    rejected: [],
};

@Injectable()
export class CreateJobApplicationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly resourceService: ResourceService,
        private readonly consentService: ConsentService,
        private readonly outboxService: OutboxService,
    ) {}

    private coerceMultipartBody(raw: Record<string, any> = {}) {
        const copy: Record<string, any> = { ...raw };
        if (copy.consent === 'true' || copy.consent === true) {
            copy.consent = true;
        } else if (copy.consent === 'false') {
            copy.consent = false;
        }
        if (copy.website === undefined) {
            copy.website = '';
        }
        if (typeof copy.startedAt === 'string') {
            const num = isNaN(Number(copy.startedAt))
                ? Date.parse(copy.startedAt)
                : Number(copy.startedAt);
            if (!isNaN(num)) {
                copy.startedAt = Math.floor(num);
            }
        }
        return copy;
    }

    async applyBySlug(
        slugOrId: string,
        rawBody: Record<string, any>,
        resume?: Express.Multer.File,
        meta: { lang?: string; ip?: string; userAgent?: string } = {},
    ) {
        const body = this.coerceMultipartBody(rawBody);

        // Honeypot & min fill time check (3s)
        if (typeof body.website === 'string' && body.website.trim() !== '') {
            return { ok: true, success: true };
        }
        const now = Date.now();
        const startedAt = Number(body.startedAt);
        if (!startedAt || isNaN(startedAt) || now - startedAt < 3000 || startedAt > now + 5000) {
            return { ok: true, success: true };
        }

        // Validate resume file by size and magic bytes first (returns 413/415 before field check or vice versa)
        validateResumeFile(resume);

        const parsed = JobApplicationSchema.safeParse(body);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: parsed.error.issues.map((i) => ({
                    field: i.path.join('.'),
                    message: i.message,
                })),
            });
        }

        const job =
            (await this.prisma.job.findFirst({
                where: { slug: slugOrId, isDeleted: false },
                include: { translations: true },
            })) ||
            (await this.prisma.job.findUnique({
                where: { id: slugOrId },
                include: { translations: true },
            }));

        if (!job || job.isDeleted || !job.isPublished) {
            throw new NotFoundException('This job posting is not available');
        }

        if (job.closesAt && new Date(job.closesAt).getTime() <= Date.now()) {
            throw new ConflictException(
                'This job posting has closed and is no longer accepting applications',
            );
        }

        const resumeKey = await this.resourceService.uploadFile(resume!, {
            visibility: 'private',
        });

        const data = parsed.data;
        const lang: 'ar' | 'en' = meta.lang === 'en' ? 'en' : 'ar';
        const normalizedMobile = normalizeSaudiMobile(data.mobile);
        const jobTitle =
            job.translations?.find((t: any) => t.language === lang)?.title ||
            job.translations?.find((t: any) => t.language === 'ar')?.title ||
            job.slug ||
            'Job Posting';

        const application = await this.prisma.$transaction(async (tx: any) => {
            const notifSection = await tx.section
                ?.findUnique({ where: { type: 'notification-settings' } })
                .catch(() => null);
            const careersInbox =
                (notifSection?.data as any)?.careersInbox ||
                (notifSection?.data as any)?.defaultInbox ||
                'careers@cpa.sa';

            const created = await tx.jobApplication.create({
                data: {
                    jobId: job.id,
                    fullName: data.fullName.trim(),
                    email: data.email.trim().toLowerCase(),
                    mobile: normalizedMobile,
                    linkedinUrl: data.linkedinUrl ? data.linkedinUrl.trim() : null,
                    motivation: data.motivation ? data.motivation.trim() : null,
                    resumeKey,
                    resumeName: resume!.originalname || 'resume.pdf',
                    resumeSize:
                        typeof resume!.size === 'number'
                            ? resume!.size
                            : resume!.buffer.length,
                    language: lang as any,
                    status: 'pending',
                    notes: [],
                },
            });

            await this.consentService.recordConsent(
                {
                    subjectType: 'application',
                    subjectId: created.id,
                    email: created.email,
                    purpose: 'job_application',
                    language: lang,
                    ip: meta.ip,
                    userAgent: meta.userAgent,
                },
                tx,
            );

            await this.outboxService.enqueueEmail(
                {
                    template: 'application-staff',
                    to: careersInbox,
                    language: 'ar',
                    payload: {
                        subject: `طلب توظيف جديد: ${jobTitle} — ${created.fullName}`,
                        applicationId: created.id,
                        jobTitle,
                        fullName: created.fullName,
                        email: created.email,
                        mobile: created.mobile,
                        linkedinUrl: created.linkedinUrl,
                        motivation: created.motivation,
                    },
                },
                tx,
            );

            await this.outboxService.enqueueEmail(
                {
                    template: 'application-ack',
                    to: created.email,
                    language: lang,
                    payload: {
                        subject:
                            lang === 'en'
                                ? `Application received for ${jobTitle} — Ahmad Abdullah CPA`
                                : `تم استلام طلب التوظيف لوظيفة ${jobTitle} — مكتب أحمد بن عبدالله`,
                        fullName: created.fullName,
                        jobTitle,
                    },
                },
                tx,
            );

            return created;
        });

        return { ok: true, success: true, id: application.id };
    }

    /** Backward-compatible execute method */
    async execute(jobId: string, data: any, resume?: Express.Multer.File) {
        return this.applyBySlug(jobId, data, resume);
    }

    async issueSignedResumeUrl(applicationId: string, adminId: string) {
        const app = await this.prisma.jobApplication.findUnique({
            where: { id: applicationId },
        });
        if (!app) {
            throw new NotFoundException(`Job application not found: ${applicationId}`);
        }

        // Write audit event (R9 / T064)
        await this.prisma.monitoringEvent
            ?.create({
                data: {
                    name: 'cv.download',
                    path: `/api/admin/applications/${applicationId}/resume`,
                    props: {
                        applicationId,
                        adminId,
                        resumeKey: app.resumeKey,
                    },
                },
            })
            .catch(() => null);

        const secret = customEnv.PREVIEW_SECRET || customEnv.JWT_SECRET || 'resume-sign-secret';
        const exp = Math.floor(Date.now() / 1000) + 300; // 5 minutes
        const payload = Buffer.from(
            JSON.stringify({
                applicationId: app.id,
                resumeKey: app.resumeKey,
                exp,
            }),
        ).toString('base64url');
        const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
        const token = `${payload}.${sig}`;
        const url = `/api/admin/applications/${applicationId}/resume/file?token=${encodeURIComponent(token)}`;

        return {
            url,
            token,
            expiresAt: new Date(exp * 1000).toISOString(),
        };
    }

    async updateStatusAdmin(
        id: string,
        input: { status?: string; assignedToId?: string | null },
    ) {
        const app = await this.prisma.jobApplication.findUnique({ where: { id } });
        if (!app) {
            throw new NotFoundException(`Application not found: ${id}`);
        }

        if (input.status && input.status !== app.status) {
            const allowed = VALID_STATUS_TRANSITIONS[app.status] || [];
            if (!allowed.includes(input.status)) {
                throw new BadRequestException(
                    `Invalid status transition from '${app.status}' to '${input.status}'`,
                );
            }
        }

        return this.prisma.jobApplication.update({
            where: { id },
            data: {
                ...(input.status ? { status: input.status as any } : {}),
                ...(input.assignedToId !== undefined
                    ? { assignedToId: input.assignedToId }
                    : {}),
            },
        });
    }

    async addNoteAdmin(id: string, authorId: string, body: string) {
        if (!body || !body.trim()) {
            throw new BadRequestException('Note body is required');
        }
        const app = await this.prisma.jobApplication.findUnique({ where: { id } });
        if (!app) {
            throw new NotFoundException(`Application not found: ${id}`);
        }

        const notes = Array.isArray(app.notes) ? [...(app.notes as any[])] : [];
        notes.push({
            authorId,
            body: body.trim(),
            at: new Date().toISOString(),
        });

        return this.prisma.jobApplication.update({
            where: { id },
            data: { notes: notes as any },
        });
    }

    async exportCsvAdmin(query: { jobId?: string; status?: string } = {}): Promise<string> {
        const where: any = {};
        if (query.jobId) where.jobId = query.jobId;
        if (query.status) where.status = query.status;

        const rows = await this.prisma.jobApplication.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                job: { include: { translations: true } },
            },
        });

        const headers = [
            'ID',
            'Job Title',
            'Full Name',
            'Email',
            'Mobile',
            'LinkedIn',
            'Status',
            'Resume Name',
            'Created At',
        ];

        const lines = [headers.join(',')];
        for (const row of rows as any[]) {
            const jobTitle =
                row.job?.translations?.find((t: any) => t.language === 'ar')?.title ||
                row.job?.slug ||
                '';
            const cells = [
                row.id,
                jobTitle,
                row.fullName,
                row.email,
                row.mobile,
                row.linkedinUrl || '',
                row.status,
                row.resumeName,
                row.createdAt instanceof Date
                    ? row.createdAt.toISOString()
                    : String(row.createdAt),
            ].map(escapeCsvCell);
            lines.push(cells.join(','));
        }

        return `\uFEFF${lines.join('\r\n')}`;
    }
}
