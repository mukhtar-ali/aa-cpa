'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import PageTransition from '@/src/animations/PageTransition';
import { PreloaderWrapper } from '@/src/animations/PreloaderWrapper';

// Exact reference routes only, so a legacy page whose slug happens to be "reference" keeps its chrome.
const REFERENCE_PATH = /^\/[a-z]{2}\/reference\/home\/?$/;

/**
 * Renders the legacy starter chrome (header, footer, preloader, page transition) around the page, except on the design-system
 * reference pages (`/<lang>/reference/*`), which bring their own chrome built only from library components. The header and footer are
 * passed in as server-rendered slots. The legacy chrome goes away in feature 003.
 */
export function ChromeSwitch({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
    const pathname = usePathname();
    if (REFERENCE_PATH.test(pathname)) return <>{children}</>;
    return (
        <PreloaderWrapper>
            <PageTransition>
                {header}
                <main className="min-h-[60vh]">{children}</main>
                {footer}
            </PageTransition>
        </PreloaderWrapper>
    );
}
