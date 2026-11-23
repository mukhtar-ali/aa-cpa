import crypto from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { pathForScope, safeLocalePath, verifyPreviewToken } from './preview';

const SECRET = 's3cret';
const sign = (payload: object, secret = SECRET) => {
    const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${h}.${p}.${crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url')}`;
};
const future = () => Math.floor(Date.now() / 1000) + 600;

describe('verifyPreviewToken', () => {
    it('accepts a valid token', () => {
        expect(verifyPreviewToken(sign({ kind: 'service', key: 'audit', exp: future() }), SECRET)).toMatchObject({ kind: 'service', key: 'audit' });
    });
    it('rejects wrong secret, expired, forged signature, junk and unknown kind', () => {
        expect(verifyPreviewToken(sign({ kind: 'service', key: 'a', exp: future() }, 'other'), SECRET)).toBeNull();
        expect(verifyPreviewToken(sign({ kind: 'service', key: 'a', exp: 1 }), SECRET)).toBeNull();
        const t = sign({ kind: 'service', key: 'a', exp: future() });
        expect(verifyPreviewToken(t.slice(0, -3) + 'abc', SECRET)).toBeNull();
        expect(verifyPreviewToken('a.b', SECRET)).toBeNull();
        expect(verifyPreviewToken(null, SECRET)).toBeNull();
        expect(verifyPreviewToken(sign({ kind: 'admin', key: 'a', exp: future() }), SECRET)).toBeNull();
    });
    it('rejects everything when the secret is not configured', () => {
        expect(verifyPreviewToken(sign({ kind: 'page', key: 'home', exp: future() }, ''), '')).toBeNull();
    });
    it('honours the clock', () => {
        const t = sign({ kind: 'page', key: 'home', exp: 2000 });
        expect(verifyPreviewToken(t, SECRET, 1_000_000)).not.toBeNull();
        expect(verifyPreviewToken(t, SECRET, 3_000_000)).toBeNull();
        vi.useRealTimers();
    });
});

describe('redirect paths', () => {
    it('allows only in-site locale paths', () => {
        expect(safeLocalePath('/en/services/audit')).toBe('/en/services/audit');
        expect(safeLocalePath('/ar')).toBe('/ar');
        for (const bad of ['//evil.com', 'https://evil.com', '/fr/x', '/en\\evil', '/enx', '', null, '/ar/\r\nSet-Cookie: x']) expect(safeLocalePath(bad as string)).toBeNull();
    });
    it('derives a path from the token scope', () => {
        expect(pathForScope('en', { kind: 'service', key: 'external-audit' })).toBe('/en/services/external-audit');
        expect(pathForScope('ar', { kind: 'page', key: 'home' })).toBe('/ar');
        expect(pathForScope('ar', { kind: 'page', key: 'unknown' })).toBeNull();
        expect(pathForScope('ar', { kind: 'article', key: '../x' })).toBeNull();
    });
});
