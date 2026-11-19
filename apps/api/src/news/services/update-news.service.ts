import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { getLangValue, LanguageEnum, NewsFormModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { sanitizeRichText } from '@/common/sanitize-html.util';
import { NewsMapper } from '../helpers/news.mapper';

@Injectable()
export class UpdateNewsService {
    constructor(private prisma: PrismaService) {}

    async execute(newsId: string, data: NewsFormModel) {
        const existing = await this.prisma.news.findUnique({
            where: { id: newsId },
            include: { translations: true },
        });
        if (!existing || existing.isDeleted) throw new NotFoundException('News article not found');

        // Enforce Arabic title
        const arTitle = getLangValue(data.title, LanguageEnum.Ar);
        if (!arTitle?.trim()) {
            throw new BadRequestException('Arabic title is required.');
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

        const willBePublished = data.isPublished ?? existing.isPublished;

        const news = await this.prisma.$transaction(async (tx) => {
            // Check slug redirect
            if (data.slug && data.slug !== existing.slug) {
                const slugConflict = await tx.news.findUnique({ where: { slug: data.slug } });
                if (slugConflict && slugConflict.id !== newsId && !slugConflict.isDeleted) {
                    throw new BadRequestException(`Slug "${data.slug}" already exists.`);
                }

                if (existing.slug) {
                    await tx.slugRedirect.upsert({
                        where: {
                            entityType_fromSlug: {
                                entityType: 'article',
                                fromSlug: existing.slug,
                            },
                        },
                        create: {
                            entityType: 'article',
                            fromSlug: existing.slug,
                            toSlug: data.slug,
                        },
                        update: {
                            toSlug: data.slug,
                        },
                    });
                }
            }

            await tx.news.update({
                where: { id: newsId },
                data: {
                    slug: data.slug || existing.slug,
                    coverImage: data.thumbnail !== undefined ? (data.thumbnail as any) : undefined,
                    categoryId: data.categoryId || existing.categoryId,
                    authorId: data.authorId !== undefined ? data.authorId : existing.authorId,
                    readingMinutes: data.readingMinutes !== undefined ? data.readingMinutes : existing.readingMinutes,
                    tags: data.tags !== undefined ? data.tags : undefined,
                    isPublished: willBePublished,
                    isFeatured: data.isFeatured !== undefined ? data.isFeatured : existing.isFeatured,
                    publishedAt: willBePublished && !existing.isPublished ? new Date() : existing.publishedAt,
                    translations: {
                        deleteMany: {},
                        create: translations,
                    },
                },
            });

            if (data.sectorIds !== undefined) {
                await tx.articleSector.deleteMany({ where: { articleId: newsId } });
                if (data.sectorIds.length) {
                    await tx.articleSector.createMany({
                        data: data.sectorIds.map((sectorId) => ({
                            articleId: newsId,
                            sectorId,
                        })),
                    });
                }
            }

            if (data.serviceIds !== undefined) {
                await tx.articleService.deleteMany({ where: { articleId: newsId } });
                if (data.serviceIds.length) {
                    await tx.articleService.createMany({
                        data: data.serviceIds.map((serviceId) => ({
                            articleId: newsId,
                            serviceId,
                        })),
                    });
                }
            }

            return tx.news.findUnique({
                where: { id: newsId },
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
}
