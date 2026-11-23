import { headers } from 'next/headers';
import { ErrorState } from '@repo/design-system/sections';
import { defaultLocale, getLabels, isLang } from '@/src/lib/i18n/dictionaries';

/** 404 inside the locale layout. The language comes from the `x-locale` header the proxy sets, with Arabic as the fallback. */
export default async function NotFound() {
    const requested = (await headers()).get('x-locale');
    const lang = isLang(requested) ? requested : defaultLocale;
    const { states } = getLabels(lang);
    return <ErrorState eyebrow="404" title={states.notFoundTitle} body={states.notFoundBody} action={{ label: states.goHome, href: `/${lang}` }} />;
}
