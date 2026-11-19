import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { enqueueRevalidate, tagsForEntity } from '@/outbox/revalidate';

@Injectable()
export class PublishServiceService {
    constructor(private readonly prisma: PrismaService) {}

    async publish(id: string, isPublished: boolean) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: {
                translations: true,
            },
        });

        if (!service || service.isDeleted) {
            throw new NotFoundException(`Service not found: ${id}`);
        }

        if (isPublished) {
            const arTr = service.translations?.find((t) => t.language === 'ar');
            if (!arTr || !arTr.title?.trim() || !arTr.summary?.trim()) {
                throw new BadRequestException('Publish guard: Service must have a non-empty Arabic title and summary to be published.');
            }
        }

        const updated = await this.prisma.service.update({
            where: { id },
            data: {
                isPublished,
                publishedAt: isPublished ? (service.publishedAt || new Date()) : null,
            },
        });

        await enqueueRevalidate(this.prisma as any, tagsForEntity('service', service.slug));
        return updated;
    }
}
