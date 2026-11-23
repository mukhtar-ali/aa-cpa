'use server';

import { headers } from 'next/headers';
import { isLang } from '@/src/lib/i18n/dictionaries';
import { submitContactCore, type ContactSubmission } from './contact-core';
import type { FormResult } from './result';

/** Contact form Server Action (contract: `submitContact`). The visitor's IP goes to the API as `X-Forwarded-For` for its rate limit. */
export async function submitContact(lang: string, input: ContactSubmission): Promise<FormResult> {
    if (!isLang(lang)) return { ok: false, error: 'generic' };
    const h = await headers();
    const clientIp = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || undefined;
    return submitContactCore(input, { lang, clientIp });
}
