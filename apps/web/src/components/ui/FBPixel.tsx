'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import * as pixel from '@/src/utilities/metaPixel';

interface FBPixelProps {
    pixelId?: string;
    /** Per-request CSP nonce. */
    nonce?: string;
}

// Standard Meta Pixel base code (from Meta's own Events Manager setup instructions) —
// wujud's equivalent loaded a local `/scripts/pixel.js` that was never actually created
// in their public/ folder, so theirs 404s if it ever runs. This is the real thing.
export function FBPixel({ pixelId, nonce }: FBPixelProps) {
    const id = pixelId || pixel.FB_PIXEL_ID;
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (!loaded) return;
        pixel.pageview();
    }, [pathname, loaded]);

    if (!id) return null;

    return (
        <>
            <Script id="fb-pixel-base" strategy="afterInteractive" nonce={nonce} onLoad={() => setLoaded(true)}>
                {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${id}');
                    fbq('track', 'PageView');
                `}
            </Script>
            <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
        </>
    );
}
