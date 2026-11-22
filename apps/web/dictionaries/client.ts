'use client';

import { useParams } from 'next/navigation';

import en from './en.json';
import ar from './ar.json';

const dictionaries = {
    en,
    ar,
};

type Locale = keyof typeof dictionaries;

export function useCurrentLocale(): Locale {
    const params = useParams();

    const lang = params.lang;

    if (lang === 'ar' || lang === 'en') {
        return lang;
    }

    return 'en';
}

export const useIsRtl = () => {
    const lang = useCurrentLocale();
    return lang === 'ar';
};

export const useHtmlDir = () => {
    const isRtl = useIsRtl();
    return isRtl ? 'rtl' : 'ltr';
};

export function useT() {
    const lang = useCurrentLocale();

    return dictionaries[lang];
}
