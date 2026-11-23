import type { Metadata } from 'next';
import type { Lang } from '@/src/lib/i18n/dictionaries';

export interface PageSeo {
    metaTitle?: string | null;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
    ogImage?: string | null;
    noindex?: boolean | null;
}

export interface BuildMetadataInput {
    lang: Lang;
    /** Path without locale prefix, e.g. `/services/audit` or `` for home. */
    path: string;
    seo?: PageSeo | null;
    /** Used when the CMS has no meta title. */
    fallbackTitle: string;
    fallbackDescription?: string;
    /** `true` for preview (draft mode) renders: never indexable. */
    preview?: boolean;
    /** Languages this page exists in; defaults to both. Arabic is always the x-default. */
    languages?: readonly Lang[];
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

const join = (lang: Lang, path: string) => `/${lang}${path ? (path.startsWith('/') ? path : `/${path}`) : ''}`;

/** One metadata function for every page (FR-011): canonical, ar/en/x-default alternates, OG basics. 004 adds structured data. */
export function buildMetadata({ lang, path, seo, fallbackTitle, fallbackDescription, preview, languages = ['ar', 'en'] }: BuildMetadataInput): Metadata {
    const title = seo?.metaTitle?.trim() || fallbackTitle;
    const description = seo?.metaDescription?.trim() || fallbackDescription;
    const canonical = seo?.canonicalUrl?.trim() || join(lang, path);

    const alternates: Record<string, string> = Object.fromEntries(languages.map((l) => [l, join(l, path)]));
    alternates['x-default'] = join('ar', path);

    return {
        metadataBase: new URL(siteUrl()),
        title,
        description,
        alternates: { canonical, languages: alternates },
        openGraph: {
            title,
            description,
            url: canonical,
            locale: lang === 'ar' ? 'ar_SA' : 'en_US',
            type: 'website',
            ...(seo?.ogImage ? { images: [seo.ogImage] } : {}),
        },
        robots: preview || seo?.noindex ? { index: false, follow: false } : undefined,
    };
}
