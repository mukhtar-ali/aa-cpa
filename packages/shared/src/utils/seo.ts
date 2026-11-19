import { safeHttpUrl } from './url';

/** The localized (single-language) content of a per-page SEO record, as returned by GET /api/seo/web. */
export interface PageSeoContentWeb {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogType?: string;
    ogImage?: string;
}

export interface ResolvedPageSeo {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    og?: { title?: string; description?: string; type?: string; image?: string };
}

const OG_TYPES = new Set(['website', 'article', 'profile', 'book']);
const clean = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
};

/**
 * Turns CMS page-SEO content into the fields a page's metadata should set. Only non-empty values are
 * returned (an empty CMS field must not blank out the site-wide default), URLs must be http(s), and
 * the Open Graph block is only returned when the page actually defines something for it.
 */
export function resolvePageSeo(content: PageSeoContentWeb | null | undefined): ResolvedPageSeo {
    if (!content) return {};
    const title = clean(content.title);
    const description = clean(content.description);
    const ogTitle = clean(content.ogTitle) ?? title;
    const ogDescription = clean(content.ogDescription) ?? description;
    const ogImage = safeHttpUrl(content.ogImage);
    const ogType = clean(content.ogType);
    const hasOg = Boolean(clean(content.ogTitle) || clean(content.ogDescription) || ogImage || ogType);

    return {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(clean(content.keywords) ? { keywords: clean(content.keywords) } : {}),
        ...(safeHttpUrl(content.canonicalUrl) ? { canonical: safeHttpUrl(content.canonicalUrl) } : {}),
        ...(hasOg
            ? {
                  og: {
                      ...(ogTitle ? { title: ogTitle } : {}),
                      ...(ogDescription ? { description: ogDescription } : {}),
                      ...(ogType && OG_TYPES.has(ogType) ? { type: ogType } : {}),
                      ...(ogImage ? { image: ogImage } : {}),
                  },
              }
            : {}),
    };
}
