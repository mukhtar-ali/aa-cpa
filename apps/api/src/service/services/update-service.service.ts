import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ServiceFormModel, ServiceFormSchema } from '@repo/shared';
import { ServiceMapper } from '../service.mapper';

@Injectable()
export class UpdateServiceService {
    constructor(private readonly prisma: PrismaService) {}

    async update(id: string, body: ServiceFormModel) {
        const parsed = ServiceFormSchema.safeParse(body);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: parsed.error.issues,
            });
        }

        const data = parsed.data;

        const current = await this.prisma.service.findUnique({
            where: { id },
        });
        if (!current || current.isDeleted) {
            throw new NotFoundException(`Service not found: ${id}`);
        }

        // If slug changed, write redirect
        if (current.slug !== data.slug) {
            await this.prisma.slugRedirect.upsert({
                where: {
                    entityType_fromSlug: {
                        entityType: 'service',
                        fromSlug: current.slug,
                    },
                },
                update: {
                    toSlug: data.slug,
                },
                create: {
                    entityType: 'service',
                    fromSlug: current.slug,
                    toSlug: data.slug,
                },
            });
        }

        const service = await this.prisma.service.update({
            where: { id },
            data: {
                slug: data.slug,
                image: data.image as any,
                heroImage: data.heroImage as any,
                icon: data.icon,
                highlight: data.highlight as any,
                methodology: data.methodology as any,
                deliverables: data.deliverables as any,
                order: data.order,
                isPublished: data.isPublished,
                publishedAt: data.isPublished
                    ? current.publishedAt || (data.publishedAt ? new Date(data.publishedAt) : new Date())
                    : null,
            },
        });

        // Upsert Arabic translation
        await this.prisma.serviceTranslation.upsert({
            where: {
                serviceId_language: {
                    serviceId: id,
                    language: 'ar',
                },
            },
            update: {
                title: data.title.ar,
                summary: data.summary.ar,
                heroSubtitle: data.heroSubtitle?.ar || null,
                statement: data.statement?.ar || null,
                audience: data.audience?.ar || null,
                whyUs: data.whyUs?.ar || null,
                metaTitle: data.metaTitle?.ar || null,
                metaDescription: data.metaDescription?.ar || null,
                keywords: data.keywords?.ar || null,
            },
            create: {
                serviceId: id,
                language: 'ar',
                title: data.title.ar,
                summary: data.summary.ar,
                heroSubtitle: data.heroSubtitle?.ar || null,
                statement: data.statement?.ar || null,
                audience: data.audience?.ar || null,
                whyUs: data.whyUs?.ar || null,
                metaTitle: data.metaTitle?.ar || null,
                metaDescription: data.metaDescription?.ar || null,
                keywords: data.keywords?.ar || null,
            },
        });

        // Upsert English translation
        await this.prisma.serviceTranslation.upsert({
            where: {
                serviceId_language: {
                    serviceId: id,
                    language: 'en',
                },
            },
            update: {
                title: data.title.en || '',
                summary: data.summary.en || '',
                heroSubtitle: data.heroSubtitle?.en || null,
                statement: data.statement?.en || null,
                audience: data.audience?.en || null,
                whyUs: data.whyUs?.en || null,
                metaTitle: data.metaTitle?.en || null,
                metaDescription: data.metaDescription?.en || null,
                keywords: data.keywords?.en || null,
            },
            create: {
                serviceId: id,
                language: 'en',
                title: data.title.en || '',
                summary: data.summary.en || '',
                heroSubtitle: data.heroSubtitle?.en || null,
                statement: data.statement?.en || null,
                audience: data.audience?.en || null,
                whyUs: data.whyUs?.en || null,
                metaTitle: data.metaTitle?.en || null,
                metaDescription: data.metaDescription?.en || null,
                keywords: data.keywords?.en || null,
            },
        });

        // Update sectors if provided
        if (data.sectorIds !== undefined) {
            await this.prisma.serviceSector.deleteMany({
                where: { serviceId: id },
            });
            if (data.sectorIds.length > 0) {
                await this.prisma.serviceSector.createMany({
                    data: data.sectorIds.map((sectorId) => ({ serviceId: id, sectorId })),
                });
            }
        }

        const fullService = await this.prisma.service.findUnique({
            where: { id },
            include: {
                translations: true,
                sectors: true,
                faqs: true,
            },
        });

        return ServiceMapper.toAdmin(fullService);
    }

    async execute(id: string, body: ServiceFormModel) {
        return this.update(id, body);
    }
}
