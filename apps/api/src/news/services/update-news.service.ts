import { Injectable, NotFoundException } from '@nestjs/common';
import { getLangValue, LanguageEnum, NewsFormModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { sanitizeRichText } from '@/common/sanitize-html.util';
import { newsMapEntityToModel } from '../helpers/news.mapper';

@Injectable()
export class UpdateNewsService {
    constructor(private prisma: PrismaService) {}

    async execute(newsId: string, data: NewsFormModel) {
        const existing = await this.prisma.news.findUnique({ where: { id: newsId } });
        if (!existing || existing.isDeleted) throw new NotFoundException('News article not found');

        const translations = Object.values(LanguageEnum).map((language) => ({
            language: language as any,
            title: getLangValue(data.title, language),
            excerpt: getLangValue(data.excerpt, language),
            body: sanitizeRichText(getLangValue(data.body, language)),
            metaTitle: getLangValue(data.metaTitle, language),
            metaDescription: getLangValue(data.metaDescription, language),
            keywords: getLangValue(data.keywords, language),
        }));

        const willBePublished = data.isPublished ?? existing.isPublished;
        const news = await this.prisma.news.update({
            where: { id: newsId },
            data: {
                thumbnail: data.thumbnail,
                tag: data.tag as any,
                isPublished: willBePublished,
                isFeatured: data.isFeatured ?? existing.isFeatured,
                publishedAt: willBePublished && !existing.isPublished ? new Date() : existing.publishedAt,
                translations: {
                    deleteMany: {},
                    create: translations,
                },
            },
            include: { translations: true },
        });
        return newsMapEntityToModel(news);
    }
}
