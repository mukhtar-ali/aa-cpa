'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PreviewBanner } from '@repo/design-system/sections';

/** Cookie set (not httpOnly) by `/api/preview` next to Next's draft-mode cookie; reading it here keeps every page statically cached (R3). */
export const PREVIEW_COOKIE = 'cpa_preview';

export function PreviewBannerGate({ message, exitLabel }: { message: string; exitLabel: string }) {
    const [active, setActive] = useState(false);
    const pathname = usePathname() || '/';
    useEffect(() => setActive(document.cookie.split('; ').some((c) => c === `${PREVIEW_COOKIE}=1`)), [pathname]);
    if (!active) return null;
    return <PreviewBanner message={message} exitLabel={exitLabel} exitHref={`/api/preview/exit?path=${encodeURIComponent(pathname)}`} />;
}
