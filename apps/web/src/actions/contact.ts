'use server';

import { headers } from 'next/headers';
import { clientIpFrom } from '@/src/lib/client-ip';
import { isLang } from '@/src/lib/i18n/dictionaries';
import { submitContactCore, type ContactSubmission } from './contact-core';
import type { FormResult } from './result';

/** Contact form Server Action (contract: `submitContact`). The visitor's IP goes to the API as `X-Forwarded-For` for its rate limit. */
export async function submitContact(lang: string, input: ContactSubmission): Promise<FormResult> {
    if (!isLang(lang)) return { ok: false, error: 'generic' };
    const h = await headers();
    const clientIp = clientIpFrom(h);
    return submitContactCore(input, { lang, clientIp });
}
