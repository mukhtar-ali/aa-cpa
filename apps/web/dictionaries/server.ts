import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import 'server-only';

const dictionaries = {
    en: () => import('./en.json').then((module) => module.default),
    ar: () => import('./ar.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const hasLocale = (locale: string): locale is Locale =>
    locale in dictionaries;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export async function getCurrentLocale(): Promise<Locale> {
    const headersList = await headers();

    const locale = headersList.get('x-locale');

    if (!locale || !hasLocale(locale)) {
        notFound();
    }

    return locale;
}

export const isRtl = async () => {
    const lang = await getCurrentLocale();
    return lang === 'ar';
};

export const getHtmlDir = async () => {
    if (await isRtl()) {
        return 'rtl';
    }
    return 'ltr';
};

export async function getT() {
    const locale = await getCurrentLocale();
    return getDictionary(locale);
}
