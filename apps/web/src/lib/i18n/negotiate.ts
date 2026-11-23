import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { defaultLocale, isLang, locales, type Lang } from './dictionaries';

/** Cookie remembering the visitor's language choice (1 year, path `/`). Research R5. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_COOKIE_OPTIONS = { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' as const };

export function fromAcceptLanguage(acceptLanguage: string | null | undefined): Lang {
    if (!acceptLanguage) return defaultLocale;
    try {
        const requested = new Negotiator({ headers: { 'accept-language': acceptLanguage } })
            .languages()
            .filter((lang) => lang && lang !== '*' && /^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/.test(lang));
        if (requested.length === 0) return defaultLocale;
        return match(requested, [...locales], defaultLocale) as Lang;
    } catch {
        return defaultLocale;
    }
}

/** Cookie wins, then Accept-Language, then Arabic. */
export function negotiateLocale(input: { cookie?: string | null; acceptLanguage?: string | null }): Lang {
    if (isLang(input.cookie)) return input.cookie;
    return fromAcceptLanguage(input.acceptLanguage);
}

/** First path segment if it is a supported locale. */
export function localeOfPath(pathname: string): Lang | undefined {
    return locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}
