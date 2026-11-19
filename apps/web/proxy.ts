import { match } from '@formatjs/intl-localematcher';
import { CookieEnum } from '@repo/ui';
import Negotiator from 'negotiator';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'ar'] as const;
const defaultLocale = 'en';

function getLocaleFromHeaders(request: NextRequest): string {
    try {
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => { headers[key] = value; });
        const rawLanguages = new Negotiator({ headers }).languages();
        const validLanguages = rawLanguages.filter(
            (lang) => lang && lang !== '*' && /^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/.test(lang)
        );
        if (validLanguages.length === 0) {
            return defaultLocale;
        }
        return match(validLanguages, locales as unknown as string[], defaultLocale);
    } catch {
        return defaultLocale;
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const pathnameLocale = locales.find(
        (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    );

    const requestHeaders = new Headers(request.headers);

    if (pathnameLocale) {
        requestHeaders.set('x-locale', pathnameLocale);

        const response = NextResponse.next({ request: { headers: requestHeaders } });
        response.cookies.set(CookieEnum.language, pathnameLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
        return response;
    }

    const cookieLocale = request.cookies.get(CookieEnum.language)?.value;
    let locale: string;
    if (cookieLocale && locales.includes(cookieLocale as (typeof locales)[number])) {
        locale = cookieLocale;
    } else {
        locale = getLocaleFromHeaders(request);
    }

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(CookieEnum.language, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon|.*\\..*).*)'],
};
