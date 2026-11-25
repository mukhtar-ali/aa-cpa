import type { Lang } from '@/src/lib/i18n/dictionaries';
import { siteUrl } from '@/src/lib/seo/page-metadata';

export interface ArticleJsonLdInput {
    lang: Lang;
    slug: string;
    title: string;
    excerpt?: string | null;
    date: string;
    image?: string | null;
    author?: { name: string; role?: string } | null;
    tags?: string[] | null;
}

/**
 * Builds schema.org Article structured data.
 */
export function buildArticleJsonLd({ lang, slug, title, excerpt, date, image, author, tags }: ArticleJsonLdInput) {
    const base = siteUrl();
    const url = `${base}/${lang}/articles/${slug}`;
    const publisherName = lang === 'ar'
        ? 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية'
        : 'Abdulrahman Al-Shubaishiri Professional Consulting';

    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: title,
        url,
        inLanguage: lang,
        datePublished: date,
        publisher: {
            '@type': 'Organization',
            name: publisherName,
            '@id': `${base}/#organization`,
        },
    };

    if (excerpt) jsonLd.description = excerpt;
    if (image) jsonLd.image = image;
    if (author?.name) {
        jsonLd.author = {
            '@type': 'Person',
            name: author.name,
            ...(author.role ? { jobTitle: author.role } : {}),
        };
    }
    if (tags && tags.length > 0) {
        jsonLd.keywords = tags.join(', ');
    }

    return jsonLd;
}
