'use client';

import { defaultLocale, getLabels } from '@/src/lib/i18n/dictionaries';

/**
 * Last-resort boundary when the root layout itself fails. It replaces the whole document, so it carries its own
 * html and body and uses plain markup: nothing here may depend on the API, the design system or the app shell.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const { states } = getLabels(defaultLocale);
    return (
        <html lang={defaultLocale} dir="rtl">
            <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, textAlign: 'center' }}>
                <main>
                    <h1>{states.errorTitle}</h1>
                    <p>{states.errorBody}</p>
                    <button type="button" onClick={reset}>
                        {states.retry}
                    </button>
                </main>
            </body>
        </html>
    );
}
