import { Injectable, NotFoundException } from '@nestjs/common';
import { publishedNow } from '@/common/visibility';
import { PrismaService } from '@/prisma/prisma.service';
import { NewsMapper } from '../helpers/news.mapper';

@Injectable()
export class GetNewsBySlugService {
    constructor(private prisma: PrismaService) {}

    async execute(slug: string, webOnly: boolean, lang: string = 'ar', previewToken?: string) {
        const where: any = { slug, isDeleted: false };
        if (webOnly) {
            Object.assign(where, publishedNow());
        }

        const news = await this.prisma.news.findFirst({
            where,
            include: {
                translations: true,
                category: true,
                author: true,
                sectors: { include: { sector: { include: { translations: true } } } },
                services: { include: { service: { include: { translations: true } } } },
            },
        });

        if (!news) {
            const redirect = await this.prisma.redirect.findFirst({
                where: {
                    fromPath: `/articles/${slug}`,
                },
            });

            if (redirect) {
                const targetSlug = redirect.toPath.replace(/^\/articles\//, '');
                return { redirectTo: targetSlug };
            }

            throw new NotFoundException(`Article not found: ${slug}`);
        }

        if (!webOnly) {
            return NewsMapper.toAdmin(news);
        }

        // Fetch up to 3 related articles
        const related = await this.prisma.news.findMany({
            where: {
                id: { not: news.id },
                ...publishedNow(),
                categoryId: news.categoryId,
            },
            take: 3,
            orderBy: { publishedAt: 'desc' },
            include: {
                translations: true,
                category: true,
                author: true,
            },
        });

        return NewsMapper.toDetailWeb(news, lang, related);
    }
}
