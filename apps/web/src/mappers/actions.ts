import type { ActionRef } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { localizeHref, safeLink } from './href';

interface ApiAction {
    label: string;
    href: string;
    external?: boolean;
    variant?: 'primary' | 'secondary' | 'outline-light' | 'link';
}

/** API action → design-system `ActionRef` (the CMS calls the on-dark outline style `outline-light`; the library calls it `paper`). */
export function toActionRef(action: ApiAction, lang: Lang): ActionRef {
    const variant = action.variant === 'outline-light' ? 'paper' : action.variant;
    return { label: action.label, href: action.external ? safeLink(action.href) : localizeHref(lang, action.href), ...(variant ? { variant } : {}) };
}
