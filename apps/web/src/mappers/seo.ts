import type { PageSeo } from '@/src/lib/seo/page-metadata';

/** API `seo` blocks come back as `{ title, description, ... }` (localized) or already as page-metadata fields; accept both. */
export function toPageSeo(seo: unknown): PageSeo | undefined {
    if (!seo || typeof seo !== 'object') return undefined;
    const s = seo as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);
    return {
        metaTitle: str(s.metaTitle) ?? str(s.title),
        metaDescription: str(s.metaDescription) ?? str(s.description),
        canonicalUrl: str(s.canonicalUrl) ?? str(s.canonical),
        ogImage: str(s.ogImage),
        noindex: typeof s.noindex === 'boolean' ? s.noindex : undefined,
    };
}
