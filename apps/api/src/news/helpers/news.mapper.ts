import { Prisma } from '@prisma/client';
import {
    ArticleDetailWeb,
    ArticleSummaryWeb,
    buildMultiLangField,
    NewsAdmin,
    NewsModel,
    TocItem,
} from '@repo/shared';
import { withSharedLang } from '@/common/prisma-language.util';

function resolveField(val: any, lang: string): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val.ar || val.en || '';
}

function extractToc(body: string): TocItem[] {
    if (!body) return [];

    const toc: TocItem[] = [];
    const htmlHeadingRegex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
    let match: RegExpExecArray | null;

    let index = 0;
    while ((match = htmlHeadingRegex.exec(body)) !== null) {
        const rawLabel = match[2].replace(/<[^>]*>/g, '').trim();
        if (rawLabel) {
            const id = rawLabel
                .toLowerCase()
                .replace(/[^\w\u0600-\u06FF]+/g, '-')
                .replace(/^-|-$/g, '') || `heading-${index}`;
            toc.push({ id, label: rawLabel, index });
            index++;
        }
    }

    if (toc.length === 0) {
        const mdHeadingRegex = /(?:^|\n)(#{2,3})\s+(.+?)(?=\n|$)/g;
        while ((match = mdHeadingRegex.exec(body)) !== null) {
            const rawLabel = match[2].trim();
            if (rawLabel) {
                const id = rawLabel
                    .toLowerCase()
                    .replace(/[^\w\u0600-\u06FF]+/g, '-')
                    .replace(/^-|-$/g, '') || `heading-${index}`;
                toc.push({ id, label: rawLabel, index });
                index++;
            }
        }
    }

    return toc;
}

function calculateReadingMinutes(body: string): number {
    if (!body) return 1;
    const words = body
        .replace(/<[^>]*>/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

export class NewsMapper {
    static toSummaryWeb(news: any, lang: string): ArticleSummaryWeb & { isFallback?: boolean } {
        const arTr = news.translations?.find((t: any) => t.language === 'ar');
        const langTr = news.translations?.find((t: any) => t.language === lang);
        const tr = langTr || arTr || news.translations?.[0] || {};
        const isFallback = lang !== 'ar' && !langTr && !!arTr;

        let imgRef: any = undefined;
        const img = news.coverImage || news.thumbnail;
        if (img) {
            imgRef = {
                src: img.url || img.src || (typeof img === 'string' ? img : ''),
                alt: resolveField(img.alt, lang) || tr.title || '',
                width: img.width || 800,
                height: img.height || 600,
            };
        } else {
            imgRef = { src: '', alt: tr.title || '', width: 800, height: 600 };
        }

        let authorWeb: any = undefined;
        if (news.author) {
            authorWeb = {
                name: resolveField(news.author.name, lang),
                role: resolveField(news.author.role, lang) || undefined,
                bio: resolveField(news.author.bio, lang) || undefined,
                avatar: news.author.avatar ? {
                    src: news.author.avatar.url || news.author.avatar.src || '',
                    alt: resolveField(news.author.avatar.alt, lang) || resolveField(news.author.name, lang),
                } : undefined,
            };
        }

        const categoryName = news.category
            ? resolveField(news.category.name, lang) || news.category.slug
            : '';

        const date = news.publishedAt
            ? new Date(news.publishedAt).toISOString().split('T')[0]
            : new Date(news.createdAt || Date.now()).toISOString().split('T')[0];

        const readingMinutes = news.readingMinutes || calculateReadingMinutes(tr.body || '');

        return {
            id: news.id,
            slug: news.slug,
            title: tr.title || '',
            category: categoryName,
            date,
            readingMinutes,
            image: imgRef,
            href: `/${lang}/articles/${news.slug}`,
            excerpt: tr.excerpt || '',
            author: authorWeb,
            isFeatured: news.isFeatured ?? false,
            isCaseStory: news.category?.isCaseStory ?? false,
            isFallback,
        };
    }

    static toDetailWeb(news: any, lang: string, relatedArticles?: any[]): ArticleDetailWeb {
        const summary = this.toSummaryWeb(news, lang);
        const arTr = news.translations?.find((t: any) => t.language === 'ar');
        const langTr = news.translations?.find((t: any) => t.language === lang);
        const tr = langTr || arTr || news.translations?.[0] || {};

        const toc = tr.tocEnabled !== false ? extractToc(tr.body || '') : [];

        let parsedTags: string[] = [];
        if (Array.isArray(news.tags)) {
            parsedTags = news.tags.map((t: any) => resolveField(t, lang)).filter(Boolean);
        }

        const related = (relatedArticles || []).map((rel) => this.toSummaryWeb(rel, lang));

        return {
            ...summary,
            body: tr.body || '',
            toc,
            tags: parsedTags,
            related,
        };
    }

    static toAdmin(news: any): NewsAdmin {
        const arTr = news.translations?.find((t: any) => t.language === 'ar') || {};
        const enTr = news.translations?.find((t: any) => t.language === 'en') || {};

        const hasArTitle = Boolean(arTr.title?.trim());
        const hasArBody = Boolean(arTr.body?.trim());
        const arStatus = hasArTitle && hasArBody ? 'complete' : hasArTitle || hasArBody ? 'partial' : 'missing';

        const hasEnTitle = Boolean(enTr.title?.trim());
        const hasEnBody = Boolean(enTr.body?.trim());
        const enStatus = hasEnTitle && hasEnBody ? 'complete' : hasEnTitle || hasEnBody ? 'partial' : 'missing';

        return {
            id: news.id,
            slug: news.slug,
            thumbnail: news.coverImage || news.thumbnail || null,
            categoryId: news.categoryId,
            authorId: news.authorId || null,
            readingMinutes: news.readingMinutes || null,
            tags: Array.isArray(news.tags) ? news.tags : [],
            isPublished: news.isPublished,
            isFeatured: news.isFeatured,
            publishedAt: news.publishedAt,
            tocEnabled: arTr.tocEnabled ?? true,
            sectorIds: (news.sectors || []).map((s: any) => s.sectorId || s.id),
            serviceIds: (news.services || []).map((s: any) => s.serviceId || s.id),
            title: { ar: arTr.title || '', en: enTr.title || '' },
            excerpt: { ar: arTr.excerpt || '', en: enTr.excerpt || '' },
            body: { ar: arTr.body || '', en: enTr.body || '' },
            metaTitle: { ar: arTr.metaTitle || '', en: enTr.metaTitle || '' },
            metaDescription: { ar: arTr.metaDescription || '', en: enTr.metaDescription || '' },
            keywords: { ar: arTr.keywords || '', en: enTr.keywords || '' },
            category: news.category || null,
            author: news.author || null,
            createdAt: news.createdAt,
            updatedAt: news.updatedAt,
            translationStatus: {
                ar: arStatus,
                en: enStatus,
            },
        };
    }
}

// Backward compatibility helper
type NewsWithTranslations = Prisma.NewsGetPayload<{ include: { translations: true } }>;
const TRANSLATABLE_FIELDS = ['title', 'excerpt', 'body', 'metaTitle', 'metaDescription', 'keywords'] as const;

export const newsMapEntityToModel = (news: NewsWithTranslations): NewsModel => {
    const { translations, isDeleted, deletedAt, createdAt, updatedAt, ...rest } = news;
    void isDeleted;
    void deletedAt;

    const sharedTranslations = withSharedLang(translations);
    const translatableFields = Object.fromEntries(
        TRANSLATABLE_FIELDS.map((field) => [field, buildMultiLangField(sharedTranslations, field)]),
    );

    return {
        ...rest,
        ...translatableFields,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
    } as unknown as NewsModel;
};
