/**
 * Returns the URL (normalised) when it is an absolute http(s) URL, otherwise undefined.
 *
 * CMS fields hold URLs that end up in `href` / `src` / `<link>` / `<meta>`. `new URL()` (and zod's
 * `.url()`) happily accept `javascript:alert(1)`, `data:` and `vbscript:` URLs, which turn a link into
 * script execution on click. Only http and https are allowed through here.
 */
export function safeHttpUrl(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (trimmed === '' || trimmed.length > 2048) return undefined;
    try {
        const url = new URL(trimmed);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
    } catch {
        return undefined;
    }
}

export const isHttpUrl = (value: unknown): boolean => safeHttpUrl(value) !== undefined;
