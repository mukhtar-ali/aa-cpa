'use server';

import { headers } from 'next/headers';
import { isLang } from '@/src/lib/i18n/dictionaries';
import { estimateCore, requestQuoteCore, type EstimateOutcome, type QuoteSubmission } from './estimator-core';
import type { FormResult } from './result';

async function clientIp() {
    const h = await headers();
    return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || undefined;
}

/** Server Actions (contract: `estimate`, `requestQuote`). */
export async function estimate(lang: string, answers: Record<string, string | number>): Promise<EstimateOutcome> {
    if (!isLang(lang)) return { ok: false, error: 'generic' };
    return estimateCore(answers, { lang, clientIp: await clientIp() });
}

export async function requestQuote(lang: string, input: QuoteSubmission): Promise<FormResult> {
    if (!isLang(lang)) return { ok: false, error: 'generic' };
    return requestQuoteCore(input, { lang, clientIp: await clientIp() });
}
