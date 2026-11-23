'use client';

import { usePathname } from 'next/navigation';
import { LanguageToggle } from '@repo/design-system/primitives';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { switchedPath } from '@/src/lib/i18n/switch-path';

interface Props {
    target: Lang;
    label: string;
    accessibleLabel: string;
}

/**
 * Language switch. The `href` is the same page in the other language, so it works without JavaScript; with JavaScript the
 * query string (filters, page) is added on click. Following it sends the visitor through the proxy, which remembers the choice.
 */
export function LocaleToggleLink({ target, label, accessibleLabel }: Props) {
    const pathname = usePathname() || '/';
    return (
        <LanguageToggle
            href={switchedPath(pathname, target)}
            label={label}
            targetLang={target}
            accessibleLabel={accessibleLabel}
            onClick={(event) => {
                const search = window.location.search;
                if (search && !event.currentTarget.href.includes('?')) event.currentTarget.href += search;
            }}
        />
    );
}
