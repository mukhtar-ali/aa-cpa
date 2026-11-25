import { siteUrl } from '@/src/lib/seo/page-metadata';

export interface BreadcrumbItem {
    label: string;
    href: string;
}

export interface BreadcrumbJsonLdInput {
    items: BreadcrumbItem[];
}

/**
 * Builds a schema.org BreadcrumbList for all inner pages.
 */
export function buildBreadcrumbJsonLd({ items }: BreadcrumbJsonLdInput) {
    if (!items || items.length === 0) return null;
    const base = siteUrl();

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => {
            const itemUrl = item.href.startsWith('http://') || item.href.startsWith('https://')
                ? item.href
                : `${base}${item.href.startsWith('/') ? '' : '/'}${item.href}`;
            return {
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                item: itemUrl,
            };
        }),
    };
}
