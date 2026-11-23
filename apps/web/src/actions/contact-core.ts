import { ContactRequestSchema, endpoint } from '@repo/shared';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { apiPost } from '@/src/lib/api/client';
import { toFormResult, type FormResult } from './result';

export interface ContactSubmission {
    name: string;
    mobile: string;
    email: string;
    service?: string;
    message: string;
    consent: boolean;
    website?: string;
    startedAt: number;
    landingPath?: string;
    turnstileToken?: string;
}

type Post = typeof apiPost;

/** Validate, then forward to `POST /api/contact`. Kept separate from the `'use server'` file so it can be unit-tested. */
export async function submitContactCore(input: ContactSubmission, ctx: { lang: Lang; clientIp?: string; post?: Post }): Promise<FormResult> {
    const parsed = ContactRequestSchema.safeParse({
        fullName: input.name,
        mobile: input.mobile,
        email: input.email,
        serviceId: input.service || undefined,
        message: input.message,
        consent: input.consent,
        website: input.website ?? '',
        startedAt: input.startedAt,
        landingPath: input.landingPath ?? '',
        turnstileToken: input.turnstileToken,
    });
    if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? 'form')] = issue.message;
        return { ok: false, error: 'invalid', fieldErrors };
    }
    try {
        const res = await (ctx.post ?? apiPost)(endpoint.contact.submit, JSON.stringify(parsed.data), { lang: ctx.lang, clientIp: ctx.clientIp, json: true });
        return toFormResult(res);
    } catch {
        return { ok: false, error: 'generic' };
    }
}
