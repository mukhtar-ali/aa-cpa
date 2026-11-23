'use client';

import { useEffect } from 'react';
import { track } from '@/src/lib/analytics';
import { channelOf } from '@/src/lib/contact-channel';

type Location = 'header' | 'footer' | 'contact' | 'float';

const LOCATIONS: readonly Location[] = ['header', 'footer', 'contact', 'float'];

/** One delegated listener: any phone, email or WhatsApp link inside an element marked `data-contact-location` fires `contact_click`. */
export function ContactClickTracker() {
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
            if (!link) return;
            const channel = channelOf(link.getAttribute('href') ?? '');
            const location = link.closest('[data-contact-location]')?.getAttribute('data-contact-location') as Location | null;
            if (channel && location && LOCATIONS.includes(location)) track('contact_click', { channel, location });
        };
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, []);
    return null;
}
