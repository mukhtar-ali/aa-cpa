'use client';

import { track } from '@/src/lib/analytics';

interface Props {
    children: React.ReactNode;
    /** Accessible names of the share buttons (the same labels the ShareBox uses) mapped to the network they share to. */
    networks: Record<string, 'x' | 'linkedin' | 'whatsapp' | 'copy'>;
}

/** Fires `article_shared` when one of the share buttons inside is pressed (the design-system ShareBox has no callback). */
export function ShareTracker({ children, networks }: Props) {
    return (
        <div
            onClick={(event) => {
                const el = (event.target as HTMLElement).closest('a, button');
                const name = el?.getAttribute('aria-label') ?? el?.textContent?.trim() ?? '';
                const network = networks[name];
                if (network) track('article_shared', { network });
            }}
        >
            {children}
        </div>
    );
}
