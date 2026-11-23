import { describe, expect, it, vi } from 'vitest';
import { estimateCore, requestQuoteCore } from './estimator-core';

const post = (over: object) => vi.fn().mockResolvedValue({ ok: true, status: 200, fieldErrors: {}, ...over });
const quote = { name: 'Omar', mobile: '0555346560', email: 'o@x.sa', consent: true, answers: { revenue: 1000 }, range: { min: 25000, max: 35000 }, startedAt: 1 };

describe('estimator actions', () => {
    it('returns the validated range', async () => {
        const p = post({ data: { min: 25000, max: 35000, currency: 'SAR', disclaimer: 'estimate only' } });
        const r = await estimateCore({ revenue: 1 }, { lang: 'en', post: p });
        expect(r).toEqual({ ok: true, range: { min: 25000, max: 35000, currency: 'SAR', disclaimer: 'estimate only' } });
        expect(JSON.parse(p.mock.calls[0][1])).toEqual({ answers: { revenue: 1 } });
    });
    it('treats an unexpected response shape as a generic error', async () => {
        expect((await estimateCore({}, { lang: 'en', post: post({ data: { nope: 1 } }) })).error).toBe('generic');
    });
    it('maps rate limits and thrown errors', async () => {
        expect((await estimateCore({}, { lang: 'en', post: post({ ok: false, status: 429 }) })).error).toBe('rateLimited');
        expect((await estimateCore({}, { lang: 'en', post: vi.fn().mockRejectedValue(new Error('x')) })).error).toBe('generic');
    });
    it('validates and forwards a quote request', async () => {
        const p = post({ status: 201 });
        expect((await requestQuoteCore(quote, { lang: 'ar', clientIp: '9.9.9.9', post: p })).ok).toBe(true);
        expect(JSON.parse(p.mock.calls[0][1])).toMatchObject({ fullName: 'Omar', range: { min: 25000, currency: 'SAR' } });
        const bad = await requestQuoteCore({ ...quote, mobile: '1' }, { lang: 'ar', post: p });
        expect(bad.fieldErrors).toHaveProperty('mobile');
        expect(p).toHaveBeenCalledTimes(1);
    });
});
