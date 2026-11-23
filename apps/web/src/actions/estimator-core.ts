import { endpoint, EstimateResponseSchema, QuoteRequestSchema } from '@repo/shared';
import { apiPost } from '@/src/lib/api/client';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toFormResult, type FormResult } from './result';

type Post = typeof apiPost;
type Answers = Record<string, string | number>;

export interface EstimateOutcome {
    ok: boolean;
    range?: { min: number; max: number; currency: string; disclaimer: string };
    error?: FormResult['error'];
}

export async function estimateCore(answers: Answers, ctx: { lang: Lang; clientIp?: string; post?: Post }): Promise<EstimateOutcome> {
    try {
        const res = await (ctx.post ?? apiPost)(endpoint.estimator.estimate, JSON.stringify({ answers }), { lang: ctx.lang, clientIp: ctx.clientIp, json: true });
        if (!res.ok) return { ok: false, error: toFormResult(res).error };
        const parsed = EstimateResponseSchema.safeParse(res.data);
        if (!parsed.success) return { ok: false, error: 'generic' };
        const { min, max, currency, disclaimer } = parsed.data;
        return { ok: true, range: { min, max, currency, disclaimer } };
    } catch {
        return { ok: false, error: 'generic' };
    }
}

export interface QuoteSubmission {
    name: string;
    mobile: string;
    email: string;
    consent: boolean;
    answers: Answers;
    range: { min: number; max: number; currency?: string };
    startedAt: number;
    website?: string;
    landingPath?: string;
}

export async function requestQuoteCore(input: QuoteSubmission, ctx: { lang: Lang; clientIp?: string; post?: Post }): Promise<FormResult> {
    const parsed = QuoteRequestSchema.safeParse({
        fullName: input.name,
        mobile: input.mobile,
        email: input.email,
        consent: input.consent,
        website: input.website ?? '',
        startedAt: input.startedAt,
        answers: input.answers,
        range: { min: input.range.min, max: input.range.max, currency: input.range.currency ?? 'SAR' },
        landingPath: input.landingPath ?? '',
    });
    if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? 'form')] = issue.message;
        return { ok: false, error: 'invalid', fieldErrors };
    }
    try {
        return toFormResult(await (ctx.post ?? apiPost)(endpoint.estimator.quote, JSON.stringify(parsed.data), { lang: ctx.lang, clientIp: ctx.clientIp, json: true }));
    } catch {
        return { ok: false, error: 'generic' };
    }
}
