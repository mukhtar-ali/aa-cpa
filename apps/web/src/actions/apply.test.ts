import { describe, expect, it, vi } from 'vitest';
import { POST } from '../../app/api/apply-upload/route';
import { forwardApplication, MAX_CV_BYTES } from './apply-core';

const pdf = (size = 10, type = 'application/pdf') => new File([new Uint8Array(size)], 'cv.pdf', { type });
const form = (file: File | null, extra: Record<string, string> = {}) => {
    const f = new FormData();
    for (const [k, v] of Object.entries({ fullName: 'Omar', email: 'o@x.sa', mobile: '0555346560', consent: 'true', website: '', startedAt: '1000', ...extra })) f.set(k, v);
    if (file) f.set('resume', file);
    return f;
};
const ok = () => vi.fn().mockResolvedValue({ ok: true, status: 201, fieldErrors: {} });

describe('forwardApplication', () => {
    it('forwards only known fields plus the file to the job apply endpoint', async () => {
        const post = ok();
        const r = await forwardApplication(form(pdf(), { evil: 'x' }), { slug: 'senior-auditor', lang: 'en', clientIp: '1.1.1.1', post });
        expect(r.ok).toBe(true);
        const [path, body, opts] = post.mock.calls[0];
        expect(path).toBe('/api/jobs/senior-auditor/apply');
        expect((body as FormData).get('evil')).toBeNull();
        expect((body as FormData).get('resume')).toBeInstanceOf(File);
        expect(opts).toMatchObject({ lang: 'en', clientIp: '1.1.1.1' });
    });
    it('rejects a missing, oversized or wrong-type file without calling the API', async () => {
        const post = ok();
        expect((await forwardApplication(form(null), { slug: 's', lang: 'en', post })).fileError).toBe('missing');
        expect((await forwardApplication(form(pdf(MAX_CV_BYTES + 1)), { slug: 's', lang: 'en', post })).fileError).toBe('tooLarge');
        expect((await forwardApplication(form(pdf(10, 'image/png')), { slug: 's', lang: 'en', post })).fileError).toBe('wrongType');
        expect(post).not.toHaveBeenCalled();
    });
    it('requires consent and an empty honeypot', async () => {
        const post = ok();
        expect((await forwardApplication(form(pdf(), { consent: 'false' }), { slug: 's', lang: 'en', post })).ok).toBe(false);
        expect((await forwardApplication(form(pdf(), { website: 'spam' }), { slug: 's', lang: 'en', post })).ok).toBe(false);
        expect(post).not.toHaveBeenCalled();
    });
    it('maps a closed job (410) and rate limit (429)', async () => {
        const mk = (status: number) => vi.fn().mockResolvedValue({ ok: false, status, fieldErrors: {} });
        expect((await forwardApplication(form(pdf()), { slug: 's', lang: 'en', post: mk(410) })).error).toBe('closed');
        expect((await forwardApplication(form(pdf()), { slug: 's', lang: 'en', post: mk(429) })).error).toBe('rateLimited');
    });
});

describe('POST /api/apply-upload', () => {
    const req = (qs: string, body?: FormData) => new Request(`http://x.test/api/apply-upload${qs}`, { method: 'POST', body });
    it('rejects a bad slug or language', async () => {
        expect((await POST(req('?slug=../x&lang=en', form(pdf())))).status).toBe(400);
        expect((await POST(req('?slug=ok&lang=fr', form(pdf())))).status).toBe(400);
    });
    it('answers 415 for a wrong file type and 413 for a large one', async () => {
        expect((await POST(req('?slug=ok&lang=en', form(pdf(10, 'image/png'))))).status).toBe(415);
        expect((await POST(req('?slug=ok&lang=en', form(pdf(MAX_CV_BYTES + 1))))).status).toBe(413);
    });
});
