import ar from '@/dictionaries/labels/ar.json';
import en from '@/dictionaries/labels/en.json';

/**
 * Chrome labels only (menu, buttons, form messages, empty/error states). Page content comes from the CMS, and the API
 * localises its own validation messages, so these are fallbacks for what the visitor sees before or without the API.
 */
export type Labels = typeof ar;
export type Lang = 'ar' | 'en';

const labels: Record<Lang, Labels> = { ar, en };

export const locales: readonly Lang[] = ['ar', 'en'];
export const defaultLocale: Lang = 'ar';

export const isLang = (value: string | undefined | null): value is Lang => value === 'ar' || value === 'en';

export const getLabels = (lang: Lang): Labels => labels[lang];

export const dirOf = (lang: Lang): 'rtl' | 'ltr' => (lang === 'ar' ? 'rtl' : 'ltr');
