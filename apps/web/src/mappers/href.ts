import type { Lang } from '@/src/lib/i18n/dictionaries';

/** Internal paths get the locale prefix; absolute URLs, mailto:, tel: and #anchors are left alone. */
export function localizeHref(lang: Lang, href: string): string {
    if (!href.startsWith('/') || href.startsWith('//')) return href;
    if (href === `/${lang}` || href.startsWith(`/${lang}/`) || href.startsWith(`/${lang}?`) || href.startsWith(`/${lang}#`)) return href;
    return href === '/' ? `/${lang}` : `/${lang}${href}`;
}
