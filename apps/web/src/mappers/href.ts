import type { Lang } from '@/src/lib/i18n/dictionaries';

const ALLOWED_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * CMS links reach `<a href>` through design-system components that do not filter schemes. A `javascript:` or `data:` value would run
 * script on click, so anything but a relative path, `#`, `?`, http(s), mailto and tel becomes `#`.
 */
export function safeLink(href: string): string {
    const value = href.replace(/[\u0000-\u001F\u007F\s]+/g, '');
    if (value === '') return '#';
    // A leading slash (including protocol-relative `//host`) is a plain link; only script-capable schemes are the problem.
    if (/^[/#?]/.test(value)) return href.trim();
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value);
    if (!scheme) return href.trim();
    return ALLOWED_SCHEMES.has(`${scheme[1].toLowerCase()}:`) ? href.trim() : '#';
}

/** Internal paths get the locale prefix; absolute URLs, mailto:, tel: and #anchors are left alone (unsafe schemes become `#`). */
export function localizeHref(lang: Lang, href: string): string {
    href = safeLink(href);
    if (!href.startsWith('/') || href.startsWith('//')) return href;
    if (href === `/${lang}` || href.startsWith(`/${lang}/`) || href.startsWith(`/${lang}?`) || href.startsWith(`/${lang}#`)) return href;
    return href === '/' ? `/${lang}` : `/${lang}${href}`;
}
