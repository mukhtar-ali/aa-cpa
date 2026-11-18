import { Injectable } from '@nestjs/common';
import { createUniqueSlug, getLangValue, LanguageEnum, NewsFormModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { sanitizeRichText } from '@/common/sanitize-html.util';
import { newsMapEntityToModel } from '../helpers/news.mapper';

@Injectable()
export class CreateNewsService {
    constructor(private prisma: PrismaService) {}

    async execute(data: NewsFormModel) {
        const englishTitle = getLangValue(data.title, LanguageEnum.En);
        const slug = await this.generateUniqueSlug(data.slug || englishTitle);

        const translations = Object.values(LanguageEnum).map((language) => ({
            language: language as any,
            title: getLangValue(data.title, language),
            excerpt: getLangValue(data.excerpt, language),
            body: sanitizeRichText(getLangValue(data.body, language)),
            metaTitle: getLangValue(data.metaTitle, language),
            metaDescription: getLangValue(data.metaDescription, language),
            keywords: getLangValue(data.keywords, language),
        }));

        const news = await this.prisma.news.create({
            data: {
                slug,
                thumbnail: data.thumbnail,
                tag: data.tag as any,
                isPublished: data.isPublished ?? false,
                isFeatured: data.isFeatured ?? false,
                publishedAt: data.isPublished ? new Date() : null,
                translations: { create: translations },
            },
            include: { translations: true },
        });
        return newsMapEntityToModel(news);
    }

    private async generateUniqueSlug(text: string): Promise<string> {
        let slug = createUniqueSlug(text);
        let exists = await this.prisma.news.findUnique({ where: { slug } });
        let counter = 1;
        while (exists) { slug += `_${counter++}`; exists = await this.prisma.news.findUnique({ where: { slug } }); }
        return slug;
    }
}
