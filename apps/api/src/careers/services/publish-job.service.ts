import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PublishJobService {
    constructor(private readonly prisma: PrismaService) {}

    async publish(id: string, isPublished: boolean) {
        const job = await this.prisma.job.findUnique({
            where: { id },
            include: { translations: true },
        });

        if (!job || job.isDeleted) {
            throw new NotFoundException(`Job not found: ${id}`);
        }

        if (isPublished) {
            const arTr = job.translations?.find((t) => t.language === 'ar');
            if (!arTr || !arTr.title?.trim()) {
                throw new BadRequestException('Publish guard: Job must have a non-empty Arabic title to be published.');
            }
        }

        return this.prisma.job.update({
            where: { id },
            data: {
                isPublished,
                publishedAt: isPublished ? (job.publishedAt || new Date()) : null,
            },
        });
    }
}
