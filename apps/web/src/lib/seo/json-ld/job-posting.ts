import type { Lang } from '@/src/lib/i18n/dictionaries';
import { siteUrl } from '@/src/lib/seo/page-metadata';

export interface JobPostingJsonLdInput {
    lang: Lang;
    slug: string;
    title: string;
    summary?: string | null;
    bodyHtml?: string | null;
    postedAt?: string | null;
    closesAt?: string | null;
    contract?: string | null;
    city?: string | null;
}

/**
 * Builds schema.org JobPosting structured data.
 * validThrough is mapped from closesAt per research R1.
 */
export function buildJobPostingJsonLd({ lang, slug, title, summary, bodyHtml, postedAt, closesAt, contract, city }: JobPostingJsonLdInput) {
    const base = siteUrl();
    const url = `${base}/${lang}/careers/${slug}`;
    const organizationName = lang === 'ar'
        ? 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية'
        : 'Abdulrahman Al-Shubaishiri Professional Consulting';

    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        '@id': `${url}#job`,
        title,
        description: bodyHtml || summary || title,
        inLanguage: lang,
        hiringOrganization: {
            '@type': 'Organization',
            name: organizationName,
            sameAs: base,
            '@id': `${base}/#organization`,
        },
    };

    if (postedAt) jsonLd.datePosted = postedAt;
    if (closesAt) jsonLd.validThrough = closesAt;
    if (contract) jsonLd.employmentType = contract;
    if (city) {
        jsonLd.jobLocation = {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: city,
                addressCountry: 'SA',
            },
        };
    }

    return jsonLd;
}
