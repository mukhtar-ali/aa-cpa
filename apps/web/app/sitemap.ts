import type { MetadataRoute } from 'next';
import { endpoint, JobModelWeb, NewsModelWeb, PaginatorModel } from '@repo/shared';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const API_URL = process.env.BASE_URL ?? 'http://localhost:3001';
const LOCALES = ['en', 'ar'] as const;

// Built when the sitemap is requested, NOT during `next build`. The list comes from the API, which is often not reachable
// (or not even deployed yet) while the image is being built; a hanging request used to fail the whole build after
// three 60 s retries. The API response is still cached for an hour.
export const dynamic = 'force-dynamic';

const API_TIMEOUT_MS = 8000;

async function fetchAll<T>(url: string): Promise<T[]> {
    try {
        // A timeout so a slow or unreachable API can never make the sitemap hang: it just lists the static pages.
        const res = await fetch(`${API_URL}${url}?pageSize=1000`, {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(API_TIMEOUT_MS),
        });
        if (!res.ok) return [];
        const data = (await res.json()) as PaginatorModel<T>;
        return data.items;
    } catch {
        return [];
    }
}

function slugEntries<T extends { slug?: string | null; updatedAt?: string }>(
    items: T[],
    pathPrefix: string,
    priority: number,
): MetadataRoute.Sitemap {
    return items
        .filter((item) => item.slug)
        .flatMap((item) =>
            LOCALES.map((locale) => ({
                url: `${SITE_URL}/${locale}${pathPrefix ? `${pathPrefix}/` : '/'}${item.slug}`,
                lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
                changeFrequency: 'weekly' as const,
                priority,
            })),
        );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [news, jobs] = await Promise.all([
        fetchAll<NewsModelWeb>(endpoint.news.listWeb),
        fetchAll<JobModelWeb>(endpoint.job.listWeb),
    ]);

    const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => [
        { url: `${SITE_URL}/${locale}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
        { url: `${SITE_URL}/${locale}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
        { url: `${SITE_URL}/${locale}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
        { url: `${SITE_URL}/${locale}/news`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
        { url: `${SITE_URL}/${locale}/careers`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    ]);

    return [
        ...staticEntries,
        ...slugEntries(news, '/news', 0.6),
        ...slugEntries(jobs, '/careers', 0.6),
    ];
}
