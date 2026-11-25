import type { Metadata } from 'next';
import { getLabels, type Lang } from '@/src/lib/i18n/dictionaries';
import { buildOgImageUrl } from './og';

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
    siteName?: string;
    /** `true` for preview (draft mode) renders: never indexable. */
    preview?: boolean;
    /** Languages this page exists in; defaults to both. Arabic is always the x-default. */
    languages?: readonly Lang[];
    ogType?: string;
    ogKey?: string;
}

/** Last-resort description from the dictionaries, by first path segment (`/services/x` → services), so no page ever ships without one. */
export function defaultDescription(lang: Lang, path: string): string {
    const descriptions = getLabels(lang).meta.descriptions as Record<string, string>;
    const segment = path.replace(/^\/+/, '').split('/')[0] || 'home';
    // The `[legal]` route serves privacy, terms and accessibility under their own slug.
    return descriptions[segment] ?? descriptions.home;
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

const join = (lang: Lang, path: string) => `/${lang}${path ? (path.startsWith('/') ? path : `/${path}`) : ''}`;

const toAbsoluteUrl = (pathWithOrWithoutLocale: string) => {
    const base = siteUrl();
    const cleanPath = pathWithOrWithoutLocale.startsWith('/') ? pathWithOrWithoutLocale : `/${pathWithOrWithoutLocale}`;
    return `${base}${cleanPath}`;
};

const resolveOgImageParams = (path: string, ogType?: string, ogKey?: string): { type: string; key: string } => {
    if (ogType && ogKey) return { type: ogType, key: ogKey };
    const clean = path.replace(/^\/+/, '');
    if (!clean) return { type: 'page', key: 'home' };
    if (clean === 'about' || clean === 'services' || clean === 'sectors' || clean === 'articles' || clean === 'careers' || clean === 'contact') {
        return { type: 'page', key: clean };
    }
    if (clean.startsWith('services/')) return { type: 'service', key: clean.replace('services/', '') };
    if (clean.startsWith('articles/')) return { type: 'article', key: clean.replace('articles/', '') };
    if (clean.startsWith('careers/')) return { type: 'job', key: clean.replace('careers/', '') };
    return { type: ogType ?? 'page', key: ogKey ?? clean };
};

/**
 * Builds localized page metadata for Next.js App Router.
 * Outputs: absolute canonical, alternates (ar, en, x-default=ar),
 * title in format "{title} | {site name}", OG images + Twitter summary_large_image,
 * og:locale and og:locale:alternate, and noindex outside production / during preview.
 */
export function buildMetadata({
    lang,
    path,
    seo,
    fallbackTitle,
    fallbackDescription,
    siteName,
    preview,
    languages = ['ar', 'en'],
    ogType,
    ogKey,
}: BuildMetadataInput): Metadata {
    const defaultSiteName = getLabels(lang).meta.home;
    const resolvedSiteName = siteName?.trim() || defaultSiteName;
    const rawTitle = seo?.metaTitle?.trim() || fallbackTitle;

    const title = path && path !== '/' && !rawTitle.includes('|') && !rawTitle.includes(resolvedSiteName)
        ? `${rawTitle} | ${resolvedSiteName}`
        : rawTitle;

    const description = seo?.metaDescription?.trim() || fallbackDescription?.trim() || defaultDescription(lang, path);

    const canonicalPath = join(lang, path);
    const canonical = seo?.canonicalUrl?.trim()
        ? (seo.canonicalUrl.trim().startsWith('http://') || seo.canonicalUrl.trim().startsWith('https://')
            ? seo.canonicalUrl.trim()
            : toAbsoluteUrl(seo.canonicalUrl.trim()))
        : toAbsoluteUrl(canonicalPath);

    const alternates: Record<string, string> = Object.fromEntries(
        languages.map((l) => [l, toAbsoluteUrl(join(l, path))]),
    );
    alternates['x-default'] = toAbsoluteUrl(join('ar', path));

    const ogParams = resolveOgImageParams(path, ogType, ogKey);
    const ogImageUrl = seo?.ogImage?.trim() || buildOgImageUrl({ type: ogParams.type, key: ogParams.key, lang });

    const isNonProduction = typeof process !== 'undefined' && Boolean(process.env.APP_ENV && process.env.APP_ENV !== 'production');
    const shouldNoindex = preview || Boolean(seo?.noindex) || isNonProduction;

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
            alternateLocale: lang === 'ar' ? ['en_US'] : ['ar_SA'],
            type: 'website',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
        },
        robots: shouldNoindex ? { index: false, follow: false } : undefined,
    };
}
