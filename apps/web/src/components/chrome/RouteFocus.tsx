'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/** After a client-side navigation, move focus to `<main>` so keyboard and screen-reader users start at the new content (WCAG 2.4.3). */
export function RouteFocus({ targetId = 'main' }: { targetId?: string }) {
    const pathname = usePathname();
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        document.getElementById(targetId)?.focus({ preventScroll: true });
    }, [pathname, targetId]);
    return null;
}
