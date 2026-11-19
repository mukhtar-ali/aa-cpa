import { BadRequestException, Injectable } from '@nestjs/common';
import { createUniqueSlug, getLangValue, LanguageEnum, NewsFormModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { sanitizeRichText } from '@/common/sanitize-html.util';
import { NewsMapper } from '../helpers/news.mapper';

@Injectable()
export class CreateNewsService {
    constructor(private prisma: PrismaService) {}

    async execute(data: NewsFormModel) {
        // Enforce Arabic title
        const arTitle = getLangValue(data.title, LanguageEnum.Ar);
        if (!arTitle?.trim()) {
            throw new BadRequestException('Arabic title is required.');
        }

        const englishTitle = getLangValue(data.title, LanguageEnum.En);
        const slug = await this.generateUniqueSlug(data.slug || englishTitle || arTitle);

        // Ensure category
        let categoryId = data.categoryId;
        if (!categoryId) {
            const firstCategory = await this.prisma.articleCategory.findFirst({
                where: { isDeleted: false },
                orderBy: { order: 'asc' },
            });
            if (firstCategory) {
                categoryId = firstCategory.id;
            } else {
                const defaultCat = await this.prisma.articleCategory.create({
                    data: {
                        slug: 'general',
                        name: { ar: 'عام', en: 'General' },
                        order: 0,
                    },
                });
                categoryId = defaultCat.id;
            }
        }

        const translations = Object.values(LanguageEnum).map((language) => ({
            language: language as any,
            title: getLangValue(data.title, language),
            excerpt: getLangValue(data.excerpt, language) || '',
            body: sanitizeRichText(getLangValue(data.body, language) || ''),
            tocEnabled: data.tocEnabled ?? true,
            metaTitle: getLangValue(data.metaTitle, language) || null,
            metaDescription: getLangValue(data.metaDescription, language) || null,
            keywords: getLangValue(data.keywords, language) || null,
        }));

        const isPublished = data.isPublished ?? false;

        const news = await this.prisma.$transaction(async (tx) => {
            const created = await tx.news.create({
                data: {
                    slug,
                    coverImage: (data.thumbnail as any) || null,
                    categoryId,
                    authorId: data.authorId || null,
                    readingMinutes: data.readingMinutes || null,
                    tags: data.tags || [],
                    isPublished,
                    isFeatured: data.isFeatured ?? false,
                    publishedAt: isPublished ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
                    translations: { create: translations },
                },
            });

            if (data.sectorIds?.length) {
                await tx.articleSector.createMany({
                    data: data.sectorIds.map((sectorId) => ({
                        articleId: created.id,
                        sectorId,
                    })),
                });
            }

            if (data.serviceIds?.length) {
                await tx.articleService.createMany({
                    data: data.serviceIds.map((serviceId) => ({
                        articleId: created.id,
                        serviceId,
                    })),
                });
            }

            return tx.news.findUnique({
                where: { id: created.id },
                include: {
                    translations: true,
                    category: true,
                    author: true,
                    sectors: true,
                    services: true,
                },
            });
        });

        return NewsMapper.toAdmin(news);
    }

    private async generateUniqueSlug(text: string): Promise<string> {
        let slug = createUniqueSlug(text);
        let exists = await this.prisma.news.findUnique({ where: { slug } });
        let counter = 1;
        while (exists) {
            slug = `${slug}_${counter++}`;
            exists = await this.prisma.news.findUnique({ where: { slug } });
        }
        return slug;
    }
}
