import type { Lang } from '@/src/lib/i18n/dictionaries';
import { siteUrl } from '@/src/lib/seo/page-metadata';

export interface ServiceJsonLdInput {
    lang: Lang;
    slug: string;
    title: string;
    summary?: string | null;
    image?: string | null;
    audience?: string | null;
}

/**
 * Builds schema.org Service structured data for service detail pages.
 */
export function buildServiceJsonLd({ lang, slug, title, summary, image, audience }: ServiceJsonLdInput) {
    const base = siteUrl();
    const url = `${base}/${lang}/services/${slug}`;
    const organizationName = lang === 'ar'
        ? 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية'
        : 'Abdulrahman Al-Shubaishiri Professional Consulting';

    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${url}#service`,
        name: title,
        url,
        inLanguage: lang,
        provider: {
            '@type': 'AccountingService',
            name: organizationName,
            '@id': `${base}/#organization`,
        },
    };

    if (summary) jsonLd.description = summary;
    if (image) jsonLd.image = image;
    if (audience) {
        jsonLd.audience = {
            '@type': 'Audience',
            audienceType: audience,
        };
    }

    return jsonLd;
}
