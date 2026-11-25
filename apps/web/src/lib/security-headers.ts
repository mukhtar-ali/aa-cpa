/**
 * Security headers for every page response (feature 004, T025, research R6).
 *
 * Scripts are allowed by a per-request NONCE plus `'strict-dynamic'` (scripts the nonce-bearing scripts load, such as GTM's own
 * loader, are trusted; the host list below is only the fallback for browsers without strict-dynamic). The pages already render per
 * request (003, `force-dynamic`, and the layout reads the nonce through `headers()`), so the nonce costs no caching.
 *
 * CSP_MODE: `report-only` (default: violations are only reported, used for the first week on staging) or `enforce`.
 * Nothing is sent in development because Next's dev server needs eval.
 */

export type CspMode = 'report-only' | 'enforce';

const originOf = (value: string | undefined) => {
    try {
        return value ? new URL(value).origin : undefined;
    } catch {
        return undefined;
    }
};

const GOOGLE = ['https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com'];
const META = ['https://connect.facebook.net', 'https://www.facebook.com'];
const TURNSTILE = 'https://challenges.cloudflare.com';

/** A fresh, unguessable nonce for one request. */
export function createNonce(): string {
    return btoa(crypto.randomUUID());
}

export function buildCsp(env: NodeJS.ProcessEnv = process.env, nonce?: string): string {
    const api = originOf(env.NEXT_PUBLIC_API_URL ?? env.BASE_URL);
    const imageHosts = (env.IMAGE_HOSTS ?? '')
        .split(',')
        .map((h) => h.trim())
        .filter((h) => /^[a-z0-9.*-]+$/i.test(h))
        .map((h) => `https://${h}`);

    const directives: Record<string, string[]> = {
        'default-src': ["'self'"],
        'script-src': ["'self'", ...(nonce ? [`'nonce-${nonce}'`, "'strict-dynamic'"] : ["'unsafe-inline'"]), GOOGLE[0], GOOGLE[1], META[0], TURNSTILE],
        // Styles stay inline-capable: React style attributes and next/font inject them; style injection is far lower risk than script.
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:', ...(api ? [api] : []), 'https://*.amazonaws.com', ...imageHosts, ...GOOGLE, META[1]],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", ...(api ? [api] : []), ...GOOGLE, ...META],
        'frame-src': [TURNSTILE, GOOGLE[0]],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
    };
    const parts = Object.entries(directives).map(([name, values]) => `${name} ${[...new Set(values)].join(' ')}`);
    // Browsers ignore this directive (and log an error) in a report-only policy, so it is only sent when enforcing.
    if (env.APP_ENV === 'production' && env.CSP_MODE === 'enforce') parts.push('upgrade-insecure-requests');
    return parts.join('; ');
}

export function cspHeaderName(env: NodeJS.ProcessEnv = process.env): string {
    return env.CSP_MODE === 'enforce' ? 'content-security-policy' : 'content-security-policy-report-only';
}

/** Headers to add to a response. Empty in development. */
export function securityHeaders(env: NodeJS.ProcessEnv = process.env, nonce?: string): Record<string, string> {
    if (env.NODE_ENV !== 'production') return {};
    const headers: Record<string, string> = {
        [cspHeaderName(env)]: buildCsp(env, nonce),
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
        'x-frame-options': 'DENY',
        'cross-origin-opener-policy': 'same-origin',
    };
    // HSTS only where the site really is the public HTTPS site; `preload` is added after the 30-day stable period (hypercare).
    if (env.APP_ENV === 'production') headers['strict-transport-security'] = 'max-age=31536000; includeSubDomains';
    return headers;
}
