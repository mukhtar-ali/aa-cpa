'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentLocale } from '@/dictionaries/client';
import type { Locale } from '@/dictionaries/server';

export const LanguageSwitcher = () => {
    const pathname = usePathname();
    const lang = useCurrentLocale();

    const redirectedPathname = (locale: Locale) => {
        if (!pathname) return '/';
        const segments = pathname.split('/');
        segments[1] = locale;
        return segments.join('/');
    };

    const nextLocale: Locale = lang === 'ar' ? 'en' : 'ar';

    return (
        <Link
            className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold transition-colors hover:border-brand hover:text-brand"
            href={redirectedPathname(nextLocale)}
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            {lang === 'ar' ? 'EN' : 'AR'}
        </Link>
    );
};
