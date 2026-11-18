import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const LOCALES = ['en', 'ar'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
    return LOCALES.map((locale) => ({
        url: `${SITE_URL}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));
}
