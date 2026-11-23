import type { MetadataRoute } from 'next';
import { endpoint } from '@repo/shared';
import { apiGet } from '@/src/lib/api/client';
import { tags } from '@/src/lib/api/endpoints';
import { siteUrl } from '@/src/lib/seo/page-metadata';

const LOCALES = ['ar', 'en'] as const;
const STATIC_PATHS = ['', '/about', '/services', '/sectors', '/articles', '/careers', '/contact', '/privacy', '/terms', '/accessibility'];

// Built when requested, not during `next build`: the API is often unreachable while the image is built. 004 completes this
// (alternates, lastmod from the CMS, image entries); this is the minimal version required by feature 003.
export const dynamic = 'force-dynamic';

interface Slugged {
    slug?: string | null;
    updatedAt?: string;
}

/** Reads a collection endpoint that returns either an array or `{ items }`. A failure lists the static pages only. */
async function slugs(path: string, tag: string): Promise<Slugged[]> {
    try {
        const data = await apiGet<Slugged[] | { items: Slugged[] }>(path, { lang: 'ar', tags: [tag], query: { pageSize: 1000 }, timeoutMs: 8000 });
        return Array.isArray(data) ? data : data.items;
    } catch {
        return [];
    }
}

const entriesFor = (prefix: string, items: Slugged[], priority: number): MetadataRoute.Sitemap =>
    items
        .filter((item) => item.slug)
        .flatMap((item) =>
            LOCALES.map((locale) => ({
                url: `${siteUrl()}/${locale}${prefix}/${item.slug}`,
                lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
                priority,
            })),
        );

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [services, articles, jobs] = await Promise.all([
        slugs(endpoint.services.list, tags.services),
        slugs(endpoint.articles.list, tags.articles),
        slugs(endpoint.jobs.list, tags.jobs),
    ]);
    const statics = STATIC_PATHS.flatMap((path) =>
        LOCALES.map((locale) => ({ url: `${siteUrl()}/${locale}${path}`, lastModified: new Date(), priority: path === '' ? 1 : 0.8 })),
    );
    return [...statics, ...entriesFor('/services', services, 0.7), ...entriesFor('/articles', articles, 0.6), ...entriesFor('/careers', jobs, 0.6)];
}
