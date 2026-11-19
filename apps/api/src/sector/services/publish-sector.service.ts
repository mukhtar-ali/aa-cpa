import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PublishSectorService {
    constructor(private readonly prisma: PrismaService) {}

    async publish(id: string, isPublished: boolean) {
        const sector = await this.prisma.sector.findUnique({
            where: { id },
            include: {
                translations: true,
            },
        });

        if (!sector || sector.isDeleted) {
            throw new NotFoundException(`Sector not found: ${id}`);
        }

        if (isPublished) {
            const arTr = sector.translations?.find((t) => t.language === 'ar');
            if (!arTr || !arTr.title?.trim() || !arTr.summary?.trim()) {
                throw new BadRequestException('Publish guard: Sector must have a non-empty Arabic title and summary to be published.');
            }
        }

        return this.prisma.sector.update({
            where: { id },
            data: {
                isPublished,
                publishedAt: isPublished ? (sector.publishedAt || new Date()) : null,
            },
        });
    }
}
