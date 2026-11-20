import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ServiceFormModel, ServiceFormSchema } from '@repo/shared';
import { ServiceMapper } from '../service.mapper';

@Injectable()
export class CreateServiceService {
    constructor(private readonly prisma: PrismaService) {}

    async create(body: ServiceFormModel) {
        const parsed = ServiceFormSchema.safeParse(body);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: parsed.error.issues,
            });
        }

        const data = parsed.data;

        const existing = await this.prisma.service.findUnique({
            where: { slug: data.slug },
        });
        if (existing) {
            throw new BadRequestException(`Slug already in use: ${data.slug}`);
        }

        const maxOrder = await this.prisma.service.findFirst({
            orderBy: { order: 'desc' },
            select: { order: true },
        });
        const order = data.order || (maxOrder ? maxOrder.order + 1 : 1);

        const service = await this.prisma.service.create({
            data: {
                slug: data.slug,
                image: data.image as any,
                heroImage: data.heroImage as any,
                icon: data.icon,
                highlight: data.highlight as any,
                methodology: data.methodology as any,
                deliverables: data.deliverables as any,
                order,
                isPublished: data.isPublished,
                publishedAt: data.isPublished ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
                translations: {
                    create: [
                        {
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
                        {
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
                    ],
                },
                sectors: data.sectorIds?.length
                    ? {
                          create: data.sectorIds.map((sectorId) => ({ sectorId })),
                      }
                    : undefined,
            },
            include: {
                translations: true,
                sectors: true,
                faqs: true,
            },
        });

        return ServiceMapper.toAdmin(service);
    }

    async execute(body: ServiceFormModel) {
        return this.create(body);
    }
}
