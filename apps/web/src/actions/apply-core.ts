import { endpoint } from '@repo/shared';
import { apiPost } from '@/src/lib/api/client';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toFormResult, type FormResult } from './result';

/** Same limits as the API (`MAX_RESUME_SIZE_BYTES`, PDF only for the public apply endpoint). The API stays the authority; this saves a round trip. */
export const MAX_CV_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application/pdf']);

const text = (data: FormData, key: string) => (typeof data.get(key) === 'string' ? (data.get(key) as string) : '');

export interface ApplyResult extends FormResult {
    /** Which file problem, when that is why it failed. */
    fileError?: 'tooLarge' | 'wrongType' | 'missing';
}

/**
 * Check the file, then forward the multipart form to `POST /api/jobs/{slug}/apply`. Used by the Server Action and by the
 * `/api/apply-upload` route handler (upload progress), so both behave the same.
 */
export async function forwardApplication(data: FormData, ctx: { slug: string; lang: Lang; clientIp?: string; post?: typeof apiPost }): Promise<ApplyResult> {
    const file = data.get('resume');
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'invalid', fileError: 'missing' };
    if (file.size > MAX_CV_BYTES) return { ok: false, error: 'invalid', fileError: 'tooLarge' };
    if (!ALLOWED_TYPES.has(file.type)) return { ok: false, error: 'invalid', fileError: 'wrongType' };
    if (text(data, 'consent') !== 'true') return { ok: false, error: 'invalid', fieldErrors: { consent: 'required' } };
    if (text(data, 'website') !== '') return { ok: false, error: 'invalid' };

    // Only the fields the API knows; anything else the browser sent is dropped.
    const body = new FormData();
    for (const key of ['fullName', 'email', 'mobile', 'linkedinUrl', 'motivation', 'consent', 'website', 'startedAt', 'turnstileToken']) {
        const value = text(data, key);
        if (value !== '') body.set(key, value);
    }
    body.set('resume', file);
    try {
        const res = await (ctx.post ?? apiPost)(endpoint.jobs.apply(ctx.slug), body, { lang: ctx.lang, clientIp: ctx.clientIp, timeoutMs: 60000 });
        return toFormResult(res);
    } catch {
        return { ok: false, error: 'generic' };
    }
}
