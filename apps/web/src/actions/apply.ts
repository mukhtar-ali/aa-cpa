'use server';

import { headers } from 'next/headers';
import { clientIpFrom } from '@/src/lib/client-ip';
import { isLang } from '@/src/lib/i18n/dictionaries';
import { forwardApplication, type ApplyResult } from './apply-core';

/** Job application Server Action (contract: `submitApplication`). FormData: form fields + `resume` file. */
export async function submitApplication(lang: string, slug: string, data: FormData): Promise<ApplyResult> {
    if (!isLang(lang) || !slug) return { ok: false, error: 'generic' };
    const h = await headers();
    const clientIp = clientIpFrom(h);
    return forwardApplication(data, { slug, lang, clientIp });
}
