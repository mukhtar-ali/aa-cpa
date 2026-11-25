import { NextRequest, NextResponse } from 'next/server';
import { getLabels } from '@/src/lib/i18n/dictionaries';
import { getRedirectMap, matchRedirect, reportRedirectHit } from '@/src/lib/redirects';
import { createNonce, cspHeaderName, buildCsp, securityHeaders } from '@/src/lib/security-headers';
import { LOCALE_COOKIE, LOCALE_COOKIE_OPTIONS, localeOfPath, negotiateLocale } from '@/src/lib/i18n/negotiate';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** 503 page used while MAINTENANCE_MODE=true (research R7). Plain HTML: it must not depend on the API or the app shell. */
export function maintenanceResponse(lang: 'ar' | 'en'): NextResponse {
    const labels = getLabels(lang).states;
    const html = `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${escapeHtml(labels.maintenanceTitle)}</title></head>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center">
<main><h1>${escapeHtml(labels.maintenanceTitle)}</h1><p>${escapeHtml(labels.maintenanceBody)}</p></main></body></html>`;
    return new NextResponse(html, {
        status: 503,
        headers: { 'content-type': 'text/html; charset=utf-8', 'retry-after': '3600', 'cache-control': 'no-store' },
    });
}

/** Adds the security headers (feature 004, T025) to whatever response the proxy produced. */
function withSecurityHeaders(response: NextResponse, nonce: string): NextResponse {
    for (const [name, value] of Object.entries(securityHeaders(process.env, nonce))) response.headers.set(name, value);
    return response;
}

export async function proxy(request: NextRequest) {
    const nonce = createNonce();
    return withSecurityHeaders(await handle(request, nonce), nonce);
}

async function handle(request: NextRequest, nonce: string) {
    const { pathname } = request.nextUrl;
    const pathLocale = localeOfPath(pathname);
    const cookie = request.cookies.get(LOCALE_COOKIE)?.value;

    if (process.env.MAINTENANCE_MODE === 'true') {
        return maintenanceResponse(
            pathLocale ?? negotiateLocale({ cookie, acceptLanguage: request.headers.get('accept-language') }),
        );
    }

    // Legacy and renamed URLs (feature 004): looked up before locale handling because old paths carry no locale prefix.
    const redirect = matchRedirect(await getRedirectMap(), pathname, request.nextUrl.search);
    if (redirect) {
        reportRedirectHit(redirect.key);
        const target = redirect.location.startsWith('/') ? new URL(redirect.location, request.url) : redirect.location;
        return NextResponse.redirect(target, redirect.status);
    }

    if (pathLocale) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-locale', pathLocale);
        // Next applies the nonce to its own scripts when it finds it in the request's CSP header; the layout reads x-nonce for ours.
        requestHeaders.set('x-nonce', nonce);
        if (process.env.NODE_ENV === 'production') requestHeaders.set(cspHeaderName(), buildCsp(process.env, nonce));
        const response = NextResponse.next({ request: { headers: requestHeaders } });
        // An editor previewing drafts (cookie from /api/preview) must never be indexed or cached by a shared cache.
        if (request.cookies.get('cpa_preview')?.value === '1') {
            response.headers.set('x-robots-tag', 'noindex, nofollow');
            response.headers.set('cache-control', 'private, no-store');
        }
        // Following a language link is the switch: remember it.
        if (cookie !== pathLocale) response.cookies.set(LOCALE_COOKIE, pathLocale, LOCALE_COOKIE_OPTIONS);
        return response;
    }

    const locale = negotiateLocale({ cookie, acceptLanguage: request.headers.get('accept-language') });
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, locale, LOCALE_COOKIE_OPTIONS);
    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon|.*\\..*).*)'],
};
