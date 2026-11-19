import { BadRequestException, Injectable } from '@nestjs/common';
import { SectorForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { SectorMapper } from '../sector.mapper';

@Injectable()
export class CreateSectorService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(data: SectorForm) {
        // Enforce Arabic title & summary
        if (!data.title?.ar?.trim() || !data.summary?.ar?.trim()) {
            throw new BadRequestException('Arabic title and summary are required.');
        }

        // Check unique slug
        const existing = await this.prisma.sector.findUnique({
            where: { slug: data.slug },
        });
        if (existing && !existing.isDeleted) {
            throw new BadRequestException(`Sector slug "${data.slug}" is already taken.`);
        }

        return this.prisma.$transaction(async (tx) => {
            const sector = await tx.sector.create({
                data: {
                    slug: data.slug,
                    icon: data.icon || null,
                    featured: data.featured ?? false,
                    bandImage: data.bandImage || undefined,
                    order: data.order ?? 0,
                    isPublished: data.isPublished ?? false,
                    publishedAt: data.isPublished ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
                },
            });

            // Arabic translation (required)
            await tx.sectorTranslation.create({
                data: {
                    sectorId: sector.id,
                    language: 'ar',
                    title: data.title.ar,
                    summary: data.summary.ar,
                    bandTitle: data.bandTitle?.ar || null,
                    bandBody: data.bandBody?.ar || null,
                    bandCtaLabel: data.bandCtaLabel?.ar || null,
                },
            });

            // English translation (optional)
            if (data.title?.en || data.summary?.en) {
                await tx.sectorTranslation.create({
                    data: {
                        sectorId: sector.id,
                        language: 'en',
                        title: data.title.en || data.title.ar,
                        summary: data.summary.en || data.summary.ar,
                        bandTitle: data.bandTitle?.en || null,
                        bandBody: data.bandBody?.en || null,
                        bandCtaLabel: data.bandCtaLabel?.en || null,
                    },
                });
            }

            // Services associations
            if (data.serviceIds && data.serviceIds.length > 0) {
                await tx.serviceSector.createMany({
                    data: data.serviceIds.map((serviceId) => ({
                        sectorId: sector.id,
                        serviceId,
                    })),
                });
            }

            const created = await tx.sector.findUnique({
                where: { id: sector.id },
                include: {
                    translations: true,
                    services: true,
                },
            });

            return SectorMapper.toAdmin(created);
        });
    }
}
