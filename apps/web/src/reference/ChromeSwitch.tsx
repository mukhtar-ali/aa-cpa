'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Exact reference routes only, so a page whose slug happens to be "reference" keeps its chrome.
const REFERENCE_PATH = /^\/[a-z]{2}\/reference\/home\/?$/;

/**
 * Wraps the page in the site header, `<main id="main">` and footer, except on the design-system reference pages
 * (`/<lang>/reference/*`), which bring their own chrome built only from library components. Header and footer are
 * server-rendered slots, so this client component adds no chrome code to the bundle.
 */
export function ChromeSwitch({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
    const pathname = usePathname();
    if (REFERENCE_PATH.test(pathname)) return <>{children}</>;
    return (
        <>
            {header}
            <main id="main" tabIndex={-1} className="min-h-[60vh] outline-none">
                {children}
            </main>
            {footer}
        </>
    );
}
