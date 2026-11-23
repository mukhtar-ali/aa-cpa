import crypto from 'node:crypto';

export type PreviewKind = 'page' | 'service' | 'sector' | 'article' | 'job';
export interface PreviewPayload {
    kind: PreviewKind;
    key: string;
    exp: number;
}

/** Cookie holding the editor's token (httpOnly): pages read it server-side to ask the API for drafts. */
export const PREVIEW_TOKEN_COOKIE = 'cpa_preview_token';
/** Readable by the banner (not httpOnly), same name the PreviewBannerGate reads. */
export const PREVIEW_FLAG_COOKIE = 'cpa_preview';

const KINDS: readonly string[] = ['page', 'service', 'sector', 'article', 'job'];

/**
 * Verify an HS256 token issued by the API (002 `PreviewService`) with the shared secret, locally: no API call. Returns `null` for
 * anything wrong: shape, signature, expiry, lifetime over 15 minutes is not checked here because the API sets `exp`.
 */
export function verifyPreviewToken(token: string | null | undefined, secret: string, now = Date.now()): PreviewPayload | null {
    if (!token || !secret) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expected = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PreviewPayload;
        if (!decoded.exp || decoded.exp <= Math.floor(now / 1000)) return null;
        if (!KINDS.includes(decoded.kind) || typeof decoded.key !== 'string') return null;
        return decoded;
    } catch {
        return null;
    }
}

/** Only paths inside the site: `/ar/...` or `/en/...` (or exactly `/ar`, `/en`). Anything else, including `//host` and `/\`, is refused. */
export function safeLocalePath(path: string | null | undefined): string | null {
    if (!path || !/^\/(ar|en)(\/|$|\?|#)/.test(path)) return null;
    if (path.startsWith('//') || path.includes('\\') || /[\r\n]/.test(path)) return null;
    return path;
}

const PAGE_PATH: Record<string, string> = { home: '', about: '/about', services: '/services', sectors: '/sectors', articles: '/articles', careers: '/careers', contact: '/contact', privacy: '/privacy', terms: '/terms', accessibility: '/accessibility' };

/** Where the editor lands when the admin link carries no `path`: derived from the token's scope. */
export function pathForScope(lang: 'ar' | 'en', scope: Pick<PreviewPayload, 'kind' | 'key'>): string | null {
    const slug = /^[a-z0-9-]+$/i.test(scope.key) ? scope.key : null;
    switch (scope.kind) {
        case 'page':
            return slug && slug in PAGE_PATH ? `/${lang}${PAGE_PATH[slug]}` : null;
        case 'service':
            return slug ? `/${lang}/services/${slug}` : null;
        case 'sector':
            return `/${lang}/sectors`;
        case 'article':
            return slug ? `/${lang}/articles/${slug}` : null;
        case 'job':
            return slug ? `/${lang}/careers/${slug}` : null;
    }
}
