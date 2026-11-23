'use server';

import { headers } from 'next/headers';
import { isLang } from '@/src/lib/i18n/dictionaries';
import { forwardApplication, type ApplyResult } from './apply-core';

/** Job application Server Action (contract: `submitApplication`). FormData: form fields + `resume` file. */
export async function submitApplication(lang: string, slug: string, data: FormData): Promise<ApplyResult> {
    if (!isLang(lang) || !slug) return { ok: false, error: 'generic' };
    const h = await headers();
    const clientIp = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || undefined;
    return forwardApplication(data, { slug, lang, clientIp });
}
