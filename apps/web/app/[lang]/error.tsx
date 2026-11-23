'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@repo/design-system/primitives';
import { ErrorState } from '@repo/design-system/sections';
import { defaultLocale, getLabels, isLang } from '@/src/lib/i18n/dictionaries';

/** Error boundary for any page under `[lang]`: a calm message and a retry; the cause stays in the console and monitoring. */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const first = (usePathname() ?? '').split('/')[1];
    const lang = isLang(first) ? first : defaultLocale;
    const { states } = getLabels(lang);
    useEffect(() => {
        console.error(error);
    }, [error]);
    return (
        <ErrorState title={states.errorTitle} body={states.errorBody} action={{ label: states.goHome, href: `/${lang}` }}>
            <Button variant="secondary" onClick={reset}>
                {states.retry}
            </Button>
        </ErrorState>
    );
}
