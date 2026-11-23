'use client';

import { useEffect, useState } from 'react';
import { WhatsAppFloat } from '@repo/design-system/layout';

const FIELD = 'input, textarea, select';

/**
 * Floating WhatsApp button. Below `md` it is hidden while a form field has focus so it never covers the field or the
 * on-screen keyboard's submit button (FR-004). Hidden entirely on the contact page, which already lists the channel.
 */
export function WhatsAppFloatGate({ href, label, hideOnContact }: { href: string; label: string; hideOnContact?: boolean }) {
    const [fieldFocused, setFieldFocused] = useState(false);
    useEffect(() => {
        const onIn = (e: FocusEvent) => setFieldFocused((e.target as Element | null)?.matches?.(FIELD) ?? false);
        const onOut = () => setFieldFocused(false);
        document.addEventListener('focusin', onIn);
        document.addEventListener('focusout', onOut);
        return () => {
            document.removeEventListener('focusin', onIn);
            document.removeEventListener('focusout', onOut);
        };
    }, []);
    if (hideOnContact) return null;
    return <WhatsAppFloat href={href} label={label} data-contact-location="float" className={fieldFocused ? 'max-md:hidden' : undefined} />;
}
