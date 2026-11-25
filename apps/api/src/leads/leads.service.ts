import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    ContactRequestSchema,
    LeadQuerySchema,
    LeadUpdateSchema,
    QuoteRequestSchema,
} from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { ConsentService } from '@/privacy/consent.service';
import { OutboxService } from '@/outbox/outbox.service';

export interface RequestClientMeta {
    lang?: string;
    ip?: string;
    userAgent?: string;
}

export function normalizeSaudiMobile(mobile: string): string {
    const cleaned = mobile.trim().replace(/[\s-]/g, '');
    if (/^05\d{8}$/.test(cleaned)) {
        return `+966${cleaned.slice(1)}`;
    }
    return cleaned;
}

export function escapeCsvCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    let str = typeof value === 'object' ? JSON.stringify(value) : String(value);
    // Prevent CSV formula injection in Excel, allowing valid international phone numbers
    if (/^[=+\-@\t\r]/.test(str) && !/^\+\d{6,15}$/.test(str)) {
        str = `'${str}`;
    }
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

@Injectable()
export class LeadsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly consentService: ConsentService,
        private readonly outboxService: OutboxService,
    ) {}

    private async getRecipientsForService(
        serviceId?: string | null,
        tx: any = this.prisma,
    ): Promise<string[]> {
        const section = await tx.section
            ?.findUnique({ where: { type: 'notification-settings' } })
            .catch(() => null);
        const data = (section?.data as Record<string, any>) ?? {};
        const defaultInbox = data.defaultInbox || 'info@cpa.sa';
        const serviceMap = (data.serviceRecipients as Record<string, string[]>) ?? {};

        if (serviceId && Array.isArray(serviceMap[serviceId]) && serviceMap[serviceId].length > 0) {
            return serviceMap[serviceId];
        }
        return [defaultInbox];
    }

    private normalizeGuardFields(rawBody: unknown): unknown {
        if (!rawBody || typeof rawBody !== 'object') return rawBody;
        const copy = { ...(rawBody as Record<string, any>) };
        if (typeof copy.startedAt === 'string') {
            const parsedNum = isNaN(Number(copy.startedAt))
                ? Date.parse(copy.startedAt)
                : Number(copy.startedAt);
            if (!isNaN(parsedNum)) {
                copy.startedAt = Math.floor(parsedNum);
            }
        }
        return copy;
    }

    async submitContact(rawBody: unknown, meta: RequestClientMeta = {}) {
        const parsed = ContactRequestSchema.safeParse(this.normalizeGuardFields(rawBody));
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: parsed.error.issues.map((i) => ({
                    field: i.path.join('.'),
                    message: i.message,
                })),
            });
        }

        const data = parsed.data;
        const lang: 'ar' | 'en' = meta.lang === 'en' ? 'en' : 'ar';
        const normalizedMobile = normalizeSaudiMobile(data.mobile);
        const serviceId = data.serviceId ? data.serviceId : null;

        const lead = await this.prisma.$transaction(async (tx: any) => {
            const recipients = await this.getRecipientsForService(serviceId, tx);

            const created = await tx.contact.create({
                data: {
                    fullName: data.fullName.trim(),
                    company: data.company ? data.company.trim() : null,
                    mobile: normalizedMobile,
                    email: data.email.trim().toLowerCase(),
                    serviceId,
                    message: data.message.trim(),
                    source: 'contact',
                    language: lang as any,
                    landingPath: data.landingPath || null,
                    status: 'new',
                    notes: [],
                },
            });

            await this.consentService.recordConsent(
                {
                    subjectType: 'contact',
                    subjectId: created.id,
                    email: created.email,
                    purpose: 'contact_request',
                    language: lang,
                    ip: meta.ip,
                    userAgent: meta.userAgent,
                },
                tx,
            );

            for (const recipient of recipients) {
                await this.outboxService.enqueueEmail(
                    {
                        template: 'lead-staff',
                        to: recipient,
                        language: 'ar',
                        payload: {
                            subject: `طلب تواصل جديد من ${created.fullName}`,
                            leadId: created.id,
                            fullName: created.fullName,
                            company: created.company,
                            mobile: created.mobile,
                            email: created.email,
                            message: created.message,
                            serviceId: created.serviceId,
                        },
                    },
                    tx,
                );
            }

            await this.outboxService.enqueueEmail(
                {
                    template: 'lead-ack',
                    to: created.email,
                    language: lang,
                    payload: {
                        subject:
                            lang === 'en'
                                ? 'We received your inquiry — Abdulrahman Al-Shabibshiri Professional Consulting'
                                : 'تم استلام استفساركم — عبدالرحمن الشبيبشيري للاستشارات المهنية',
                        fullName: created.fullName,
                    },
                },
                tx,
            );

            return created;
        });

        return { ok: true, success: true, id: lead.id };
    }

    async submitQuote(rawBody: unknown, meta: RequestClientMeta = {}) {
        const parsed = QuoteRequestSchema.safeParse(this.normalizeGuardFields(rawBody));
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: parsed.error.issues.map((i) => ({
                    field: i.path.join('.'),
                    message: i.message,
                })),
            });
        }

        const data = parsed.data;
        const lang: 'ar' | 'en' = meta.lang === 'en' ? 'en' : 'ar';
        const normalizedMobile = normalizeSaudiMobile(data.mobile);

        const lead = await this.prisma.$transaction(async (tx: any) => {
            const recipients = await this.getRecipientsForService(null, tx);

            const created = await tx.contact.create({
                data: {
                    fullName: data.fullName.trim(),
                    company: data.company ? data.company.trim() : null,
                    mobile: normalizedMobile,
                    email: data.email.trim().toLowerCase(),
                    source: 'estimator',
                    estimatorAnswers: data.answers as any,
                    estimatedRange: data.range as any,
                    language: lang as any,
                    landingPath: data.landingPath || null,
                    status: 'new',
                    notes: [],
                },
            });

            await this.consentService.recordConsent(
                {
                    subjectType: 'quote',
                    subjectId: created.id,
                    email: created.email,
                    purpose: 'quote_request',
                    language: lang,
                    ip: meta.ip,
                    userAgent: meta.userAgent,
                },
                tx,
            );

            for (const recipient of recipients) {
                await this.outboxService.enqueueEmail(
                    {
                        template: 'quote-staff',
                        to: recipient,
                        language: 'ar',
                        payload: {
                            subject: `طلب عرض سعر جديد من الحاسبة التقديرية — ${created.fullName}`,
                            leadId: created.id,
                            fullName: created.fullName,
                            company: created.company,
                            mobile: created.mobile,
                            email: created.email,
                            answers: data.answers,
                            range: data.range,
                        },
                    },
                    tx,
                );
            }

            await this.outboxService.enqueueEmail(
                {
                    template: 'quote-ack',
                    to: created.email,
                    language: lang,
                    payload: {
                        subject:
                            lang === 'en'
                                ? 'Your fee estimate & quote request — Abdulrahman Al-Shabibshiri Professional Consulting'
                                : 'تقدير الأتعاب وطلب عرض السعر — عبدالرحمن الشبيبشيري للاستشارات المهنية',
                        fullName: created.fullName,
                        range: data.range,
                    },
                },
                tx,
            );

            return created;
        });

        return { ok: true, success: true, id: lead.id };
    }

    private buildAdminWhere(rawQuery: Record<string, any> = {}) {
        const parsed = LeadQuerySchema.safeParse(rawQuery);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Invalid query parameters',
                errors: parsed.error.issues,
            });
        }
        const query = parsed.data;

        const where: any = { isDeleted: false };

        if (Array.isArray(query.status) && query.status.length > 0) {
            where.status = { in: query.status };
        }

        if (Array.isArray(query.source) && query.source.length > 0) {
            where.source = { in: query.source };
        }

        if (query.serviceId) {
            where.serviceId = query.serviceId;
        }
        if (query.assignedToId) {
            where.assignedToId = query.assignedToId;
        }
        if (query.from || query.to) {
            where.createdAt = {};
            if (query.from) where.createdAt.gte = new Date(query.from);
            if (query.to) where.createdAt.lte = new Date(query.to);
        }
        if (query.q && String(query.q).trim()) {
            const q = String(query.q).trim();
            where.OR = [
                { fullName: { contains: q } },
                { email: { contains: q } },
                { mobile: { contains: q } },
                { company: { contains: q } },
            ];
        }

        return { where, query };
    }

    async listAdmin(rawQuery: Record<string, any> = {}) {
        const { where, query } = this.buildAdminWhere(rawQuery);
        const pageNumber = Number(query.pageNumber) > 0 ? Number(query.pageNumber) : 1;
        const pageSize = Number(query.pageSize) > 0 ? Number(query.pageSize) : 20;

        const [items, total] = await Promise.all([
            this.prisma.contact.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
                include: {
                    service: { include: { translations: true } },
                    assignedTo: { select: { id: true, username: true, email: true } },
                },
            }),
            this.prisma.contact.count({ where }),
        ]);

        return {
            items,
            total,
            pageNumber,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async getByIdAdmin(id: string) {
        const lead = await this.prisma.contact.findUnique({
            where: { id },
            include: {
                service: { include: { translations: true } },
                assignedTo: { select: { id: true, username: true, email: true } },
            },
        });

        if (!lead || lead.isDeleted) {
            throw new NotFoundException(`Lead not found: ${id}`);
        }

        const consentRecord = await this.prisma.consentRecord.findFirst({
            where: {
                subjectId: id,
                subjectType: { in: ['contact', 'quote'] as any },
            },
            orderBy: { consentedAt: 'desc' },
        });

        return {
            ...lead,
            notes: Array.isArray(lead.notes) ? lead.notes : [],
            consentRecord: consentRecord
                ? {
                      ipHash: consentRecord.ipHash,
                      policyVersion: consentRecord.policyVersion,
                      consentedAt: consentRecord.consentedAt,
                      userAgent: consentRecord.userAgent,
                  }
                : null,
        };
    }

    async updateAdmin(id: string, rawBody: unknown) {
        const parsed = LeadUpdateSchema.safeParse(rawBody);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Invalid lead update payload',
                errors: parsed.error.issues,
            });
        }

        const existing = await this.prisma.contact.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) {
            throw new NotFoundException(`Lead not found: ${id}`);
        }

        return this.prisma.contact.update({
            where: { id },
            data: {
                ...(parsed.data.status !== undefined ? { status: parsed.data.status as any } : {}),
                ...(parsed.data.assignedToId !== undefined
                    ? { assignedToId: parsed.data.assignedToId }
                    : {}),
            },
        });
    }

    async addNoteAdmin(id: string, authorId: string, body: string) {
        if (!body || !body.trim()) {
            throw new BadRequestException('Note body cannot be empty');
        }

        return this.prisma.$transaction(async (tx: any) => {
            await tx.$queryRaw`SELECT id FROM contacts WHERE id = ${id} FOR UPDATE`;

            const existing = await tx.contact.findUnique({ where: { id } });
            if (!existing || existing.isDeleted) {
                throw new NotFoundException(`Lead not found: ${id}`);
            }

            const currentNotes = Array.isArray(existing.notes) ? [...(existing.notes as any[])] : [];
            const newNote = {
                authorId,
                body: body.trim(),
                at: new Date().toISOString(),
            };
            currentNotes.push(newNote);

            return tx.contact.update({
                where: { id },
                data: {
                    notes: currentNotes as any,
                },
            });
        });
    }

    async exportCsvAdmin(rawQuery: Record<string, any> = {}): Promise<string> {
        const { where } = this.buildAdminWhere(rawQuery);
        const rows = await this.prisma.contact.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                service: { include: { translations: true } },
                assignedTo: { select: { id: true, username: true } },
            },
        });

        const headers = [
            'ID',
            'Full Name',
            'Company',
            'Mobile',
            'Email',
            'Source',
            'Status',
            'Service',
            'Message',
            'Language',
            'Created At',
        ];

        const lines = [headers.join(',')];
        for (const row of rows as any[]) {
            const serviceTitle =
                row.service?.translations?.find((t: any) => t.language === 'ar')?.title ||
                row.service?.slug ||
                '';
            const cells = [
                row.id,
                row.fullName,
                row.company || '',
                row.mobile,
                row.email,
                row.source,
                row.status,
                serviceTitle,
                row.message || '',
                row.language,
                row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
            ].map(escapeCsvCell);
            lines.push(cells.join(','));
        }

        // Prefix UTF-8 BOM so Excel opens Arabic characters cleanly
        return `\uFEFF${lines.join('\r\n')}`;
    }
}
