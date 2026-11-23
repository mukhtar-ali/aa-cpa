import { describe, expect, it, vi } from 'vitest';
import { submitContactCore, type ContactSubmission } from './contact-core';
import { toFormResult } from './result';

const valid: ContactSubmission = { name: 'Omar', mobile: '0555346560', email: 'o@x.sa', message: 'I need an audit quote please', consent: true, startedAt: 1000 };
const post = (over: object) => vi.fn().mockResolvedValue({ ok: true, status: 201, fieldErrors: {}, ...over });

describe('submitContactCore', () => {
    it('forwards a valid lead with the IP and language', async () => {
        const p = post({});
        const r = await submitContactCore({ ...valid, service: 'svc-1', landingPath: '/en/services/audit' }, { lang: 'en', clientIp: '1.2.3.4', post: p });
        expect(r.ok).toBe(true);
        const [path, body, opts] = p.mock.calls[0];
        expect(path).toBe('/api/contact');
        expect(JSON.parse(body)).toMatchObject({ fullName: 'Omar', serviceId: 'svc-1', landingPath: '/en/services/audit' });
        expect(opts).toMatchObject({ lang: 'en', clientIp: '1.2.3.4', json: true });
    });
    it('rejects bad input locally without calling the API', async () => {
        const p = post({});
        const r = await submitContactCore({ ...valid, mobile: '123', message: 'short' }, { lang: 'ar', post: p });
        expect(r.ok).toBe(false);
        expect(r.fieldErrors).toHaveProperty('mobile');
        expect(p).not.toHaveBeenCalled();
    });
    it('rejects a filled honeypot', async () => {
        const r = await submitContactCore({ ...valid, website: 'http://spam' }, { lang: 'ar', post: post({}) });
        expect(r.ok).toBe(false);
    });
    it('maps API failures', async () => {
        expect((await submitContactCore(valid, { lang: 'ar', post: post({ ok: false, status: 429 }) })).error).toBe('rateLimited');
        expect((await submitContactCore(valid, { lang: 'ar', post: post({ ok: false, status: 422, fieldErrors: { email: 'bad' } }) })).fieldErrors).toEqual({ email: 'bad' });
        expect((await submitContactCore(valid, { lang: 'ar', post: vi.fn().mockRejectedValue(new Error('x')) })).error).toBe('generic');
    });
});

describe('toFormResult', () => {
    it('treats 410 as closed and 500 as generic', () => {
        expect(toFormResult({ ok: false, status: 410, fieldErrors: {} }).error).toBe('closed');
        expect(toFormResult({ ok: false, status: 500, fieldErrors: {} }).error).toBe('generic');
    });
});
