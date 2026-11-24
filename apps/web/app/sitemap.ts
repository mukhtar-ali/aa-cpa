import type { MetadataRoute } from 'next';
import { endpoint } from '@repo/shared';
import { apiGet } from '@/src/lib/api/client';
import { tags } from '@/src/lib/api/endpoints';
import { siteUrl } from '@/src/lib/seo/page-metadata';

const LOCALES = ['ar', 'en'] as const;
const STATIC_PATHS = ['', '/about', '/services', '/sectors', '/articles', '/careers', '/contact', '/privacy', '/terms', '/accessibility'];

export const dynamic = 'force-dynamic';

export interface SitemapItem {
    slug?: string | null;
    updatedAt?: string | null;
    date?: string | null;
    draft?: boolean;
    isDraft?: boolean;
    status?: string;
    noindex?: boolean;
    seo?: { noindex?: boolean | null } | null;
}

/** Reads a collection endpoint that returns either an array or `{ items }`. A failure lists the static pages only. */
async function fetchSlugs(path: string, tag: string): Promise<SitemapItem[]> {
    try {
        const data = await apiGet<SitemapItem[] | { items: SitemapItem[] }>(path, {
            lang: 'ar',
            tags: [tag],
            query: { pageSize: 1000 },
            timeoutMs: 8000,
        });
        return Array.isArray(data) ? data : data.items;
    } catch {
        return [];
    }
}

const isIndexable = (item: SitemapItem): boolean => {
    if (!item.slug || !item.slug.trim()) return false;
    if (item.draft || item.isDraft || item.status === 'draft') return false;
    if (item.noindex || item.seo?.noindex) return false;
    return true;
};

const buildAlternates = (subpath: string) => {
    const base = siteUrl();
    return {
        languages: {
            ar: `${base}/ar${subpath}`,
            en: `${base}/en${subpath}`,
            'x-default': `${base}/ar${subpath}`,
        },
    };
};

const entriesFor = (prefix: string, items: SitemapItem[], priority: number): MetadataRoute.Sitemap =>
    items
        .filter(isIndexable)
        .flatMap((item) => {
            const subpath = `${prefix}/${item.slug}`;
            const lastModified = item.updatedAt
                ? new Date(item.updatedAt)
                : item.date
                    ? new Date(item.date)
                    : new Date();
            const alternates = buildAlternates(subpath);

            return LOCALES.map((locale) => ({
                url: `${siteUrl()}/${locale}${subpath}`,
                lastModified,
                priority,
                alternates,
            }));
        });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [services, articles, jobs] = await Promise.all([
        fetchSlugs(endpoint.services.list, tags.services),
        fetchSlugs(endpoint.articles.list, tags.articles),
        fetchSlugs(endpoint.jobs.list, tags.jobs),
    ]);

    const statics = STATIC_PATHS.flatMap((path) => {
        const alternates = buildAlternates(path);
        return LOCALES.map((locale) => ({
            url: `${siteUrl()}/${locale}${path}`,
            lastModified: new Date(),
            priority: path === '' ? 1 : 0.8,
            alternates,
        }));
    });

    return [
        ...statics,
        ...entriesFor('/services', services, 0.7),
        ...entriesFor('/articles', articles, 0.6),
        ...entriesFor('/careers', jobs, 0.6),
    ];
}
