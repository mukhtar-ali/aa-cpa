import type { MetadataRoute } from 'next';
import { siteUrl } from '@/src/lib/seo/page-metadata';

/**
 * Generates robots.txt based on APP_ENV environment.
 * Production allows all public pages except `/api/` and `/*\/reference/`.
 * Any other environment disallows all indexing (`Disallow: /`).
 */
// Read APP_ENV when requested, not at build: the same image must answer correctly in staging and production (feature 004).
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
    const isProduction = process.env.APP_ENV === 'production';
    const sitemap = `${siteUrl()}/sitemap.xml`;

    if (!isProduction) {
        return {
            rules: {
                userAgent: '*',
                disallow: '/',
            },
            sitemap,
        };
    }

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/*/reference/'],
        },
        sitemap,
    };
}
