import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PublishNewsService {
    constructor(private readonly prisma: PrismaService) {}

    async publish(id: string, isPublished: boolean) {
        const news = await this.prisma.news.findUnique({
            where: { id },
            include: { translations: true },
        });

        if (!news || news.isDeleted) {
            throw new NotFoundException(`Article not found: ${id}`);
        }

        if (isPublished) {
            const arTr = news.translations?.find((t) => t.language === 'ar');
            if (!arTr || !arTr.title?.trim()) {
                throw new BadRequestException('Publish guard: Article must have a non-empty Arabic title to be published.');
            }
        }

        return this.prisma.news.update({
            where: { id },
            data: {
                isPublished,
                publishedAt: isPublished ? (news.publishedAt || new Date()) : null,
            },
        });
    }
}
