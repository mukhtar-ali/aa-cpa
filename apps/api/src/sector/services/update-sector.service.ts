import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SectorForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { SectorMapper } from '../sector.mapper';

@Injectable()
export class UpdateSectorService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(id: string, data: SectorForm) {
        if (!data.title?.ar?.trim() || !data.summary?.ar?.trim()) {
            throw new BadRequestException('Arabic title and summary are required.');
        }

        const existing = await this.prisma.sector.findUnique({
            where: { id },
            include: { translations: true },
        });

        if (!existing || existing.isDeleted) {
            throw new NotFoundException(`Sector not found: ${id}`);
        }

        return this.prisma.$transaction(async (tx) => {
            // Slug change detection -> record redirect
            if (data.slug && data.slug !== existing.slug) {
                const slugConflict = await tx.sector.findUnique({
                    where: { slug: data.slug },
                });
                if (slugConflict && slugConflict.id !== id && !slugConflict.isDeleted) {
                    throw new BadRequestException(`Sector slug "${data.slug}" is already taken.`);
                }

                await tx.slugRedirect.upsert({
                    where: {
                        entityType_fromSlug: {
                            entityType: 'sector',
                            fromSlug: existing.slug,
                        },
                    },
                    create: {
                        entityType: 'sector',
                        fromSlug: existing.slug,
                        toSlug: data.slug,
                    },
                    update: {
                        toSlug: data.slug,
                    },
                });
            }

            await tx.sector.update({
                where: { id },
                data: {
                    slug: data.slug,
                    icon: data.icon !== undefined ? (data.icon || null) : undefined,
                    featured: data.featured !== undefined ? data.featured : undefined,
                    bandImage: data.bandImage !== undefined ? (data.bandImage || null) : undefined,
                    order: data.order !== undefined ? data.order : undefined,
                    isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
                    publishedAt: data.isPublished
                        ? (existing.publishedAt || (data.publishedAt ? new Date(data.publishedAt) : new Date()))
                        : null,
                },
            });

            // Upsert Arabic translation
            await tx.sectorTranslation.upsert({
                where: {
                    sectorId_language: {
                        sectorId: id,
                        language: 'ar',
                    },
                },
                create: {
                    sectorId: id,
                    language: 'ar',
                    title: data.title.ar,
                    summary: data.summary.ar,
                    bandTitle: data.bandTitle?.ar || null,
                    bandBody: data.bandBody?.ar || null,
                    bandCtaLabel: data.bandCtaLabel?.ar || null,
                },
                update: {
                    title: data.title.ar,
                    summary: data.summary.ar,
                    bandTitle: data.bandTitle?.ar || null,
                    bandBody: data.bandBody?.ar || null,
                    bandCtaLabel: data.bandCtaLabel?.ar || null,
                },
            });

            // Upsert English translation
            if (data.title?.en !== undefined || data.summary?.en !== undefined) {
                await tx.sectorTranslation.upsert({
                    where: {
                        sectorId_language: {
                            sectorId: id,
                            language: 'en',
                        },
                    },
                    create: {
                        sectorId: id,
                        language: 'en',
                        title: data.title?.en || '',
                        summary: data.summary?.en || '',
                        bandTitle: data.bandTitle?.en || null,
                        bandBody: data.bandBody?.en || null,
                        bandCtaLabel: data.bandCtaLabel?.en || null,
                    },
                    update: {
                        title: data.title?.en || '',
                        summary: data.summary?.en || '',
                        bandTitle: data.bandTitle?.en || null,
                        bandBody: data.bandBody?.en || null,
                        bandCtaLabel: data.bandCtaLabel?.en || null,
                    },
                });
            }

            // Sync service associations
            if (data.serviceIds !== undefined) {
                await tx.serviceSector.deleteMany({
                    where: { sectorId: id },
                });
                if (data.serviceIds.length > 0) {
                    await tx.serviceSector.createMany({
                        data: data.serviceIds.map((serviceId) => ({
                            sectorId: id,
                            serviceId,
                        })),
                    });
                }
            }

            const updated = await tx.sector.findUnique({
                where: { id },
                include: {
                    translations: true,
                    services: true,
                },
            });

            return SectorMapper.toAdmin(updated);
        });
    }
}
