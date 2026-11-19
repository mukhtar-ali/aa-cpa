import { cache } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import {
    endpoint,
    resolvePageSeo,
    type PageSeoContentWeb,
    type WebsiteInfoSectionModelWeb,
} from '@repo/shared';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

/** The route param is attacker-controlled text; only the supported locales may reach the API query/header. */
const apiLang = (lang: string): 'en' | 'ar' => (lang === 'ar' ? 'ar' : 'en');

/** Site-wide contact / social / branding settings (admin: Settings > General), localized to `lang`. */
export async function getWebsiteInfo(rawLang: string): Promise<WebsiteInfoSectionModelWeb | null> {
    const lang = apiLang(rawLang);
    try {
        const res = await fetch(`${BASE_URL}${endpoint.common.web}?lang=${lang}`, {
            headers: { 'Accept-Language': lang },
            next: { revalidate: 300 },
        });
        if (!res.ok) return null;
        return (await res.json()) as WebsiteInfoSectionModelWeb;
    } catch {
        return null;
    }
}

/**
 * Fetches one page's aggregate (`…/page/web`, or the home/about aggregates): its SEO, its content and, for
 * listing pages, one page of items, all in a single API call. Wrapped in React's `cache`, so a page's
 * `generateMetadata` and its body share one request. Returns null when the API is unreachable, in which
 * case the page renders its built-in fallbacks and the site-wide SEO defaults.
 */
export const fetchPage = cache(async <T,>(path: string, rawLang: string, query = ''): Promise<T | null> => {
    const lang = apiLang(rawLang);
    const separator = query ? '&' : '';
    try {
        // `lang` is part of the URL so the cached /en and /ar responses can never be shared.
        const res = await fetch(`${BASE_URL}${path}?lang=${lang}${separator}${query}`, {
            headers: { 'Accept-Language': lang },
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return (await res.json()) as T;
    } catch {
        return null;
    }
});

/** Page number from `?page=`; anything that is not a positive integer is page 1. */
export function parsePageNumber(raw: string | string[] | undefined): number {
    const value = Number(Array.isArray(raw) ? raw[0] : raw);
    return Number.isInteger(value) && value > 0 ? value : 1;
}

/**
 * Next.js metadata from a page's own SEO (admin: the page's SEO tab). Anything the CMS leaves empty is
 * simply not set, so the site-wide defaults from the root layout still apply. Next replaces a top-level
 * key such as `openGraph` wholesale rather than merging it, so when a page defines Open Graph fields but
 * no image of its own, the parent's (site-wide) images are carried over explicitly.
 *
 * For page 2+ of a list the title gets a "Page N" suffix and the CMS canonical is dropped (it points at
 * page 1), so paginated pages are not seen as duplicates of the first one.
 */
export async function buildPageMetadata(
    content: PageSeoContentWeb | null | undefined,
    parent?: ResolvingMetadata,
    options: { page?: number; pageLabel?: string } = {},
): Promise<Metadata> {
    const seo = resolvePageSeo(content);
    const paged = (options.page ?? 1) > 1;
    const title = seo.title && paged ? `${seo.title} – ${options.pageLabel ?? 'Page'} ${options.page}` : seo.title;
    const inheritedImages = seo.og && !seo.og.image && parent ? (await parent).openGraph?.images : undefined;
    return {
        ...(title ? { title } : {}),
        ...(seo.description ? { description: seo.description } : {}),
        ...(seo.keywords ? { keywords: seo.keywords } : {}),
        ...(seo.canonical && !paged ? { alternates: { canonical: seo.canonical } } : {}),
        ...(seo.og
            ? {
                  openGraph: {
                      ...(seo.og.title ? { title: seo.og.title } : {}),
                      ...(seo.og.description ? { description: seo.og.description } : {}),
                      ...(seo.og.type ? { type: seo.og.type as 'website' | 'article' | 'profile' | 'book' } : {}),
                      ...(seo.og.image ? { images: [seo.og.image] } : inheritedImages ? { images: inheritedImages } : {}),
                  },
              }
            : {}),
    };
}

export interface HeaderProject {
    slug: string;
    title: string;
}

/** Published projects for the header's Projects menu (first 8). A failure just hides the dropdown. */
export async function getHeaderProjects(rawLang: string): Promise<HeaderProject[]> {
    const lang = apiLang(rawLang);
    try {
        const res = await fetch(`${BASE_URL}${endpoint.project.listWeb}?pageSize=8`, {
            headers: { 'Accept-Language': lang },
            next: { revalidate: 300 },
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { items?: { slug?: string; title?: string }[] };
        return (data.items ?? [])
            .filter((p): p is { slug: string; title?: string } => Boolean(p.slug))
            .map((p) => ({ slug: p.slug, title: p.title || p.slug }));
    } catch {
        return [];
    }
}
