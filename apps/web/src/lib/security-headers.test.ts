import { describe, expect, it } from 'vitest';
import { buildCsp, createNonce, securityHeaders } from './security-headers';

const prod = (extra: Record<string, string> = {}) => ({ NODE_ENV: 'production', APP_ENV: 'production', NEXT_PUBLIC_API_URL: 'https://api.aacpa.sa', ...extra }) as unknown as NodeJS.ProcessEnv;

describe('security headers', () => {
    it('sends nothing in development', () => {
        expect(securityHeaders({ NODE_ENV: 'development' } as unknown as NodeJS.ProcessEnv)).toEqual({});
    });

    it('is report-only by default and enforcing with CSP_MODE=enforce', () => {
        expect(Object.keys(securityHeaders(prod()))).toContain('content-security-policy-report-only');
        expect(securityHeaders(prod())['content-security-policy']).toBeUndefined();
        expect(securityHeaders(prod({ CSP_MODE: 'enforce' }))['content-security-policy']).toContain("default-src 'self'");
    });

    it('locks framing, plugins and base/form targets, and never allows eval', () => {
        const csp = buildCsp(prod());
        expect(csp).toContain("frame-ancestors 'none'");
        expect(csp).toContain("object-src 'none'");
        expect(csp).toContain("base-uri 'self'");
        expect(csp).toContain("form-action 'self'");
        expect(csp).not.toContain('unsafe-eval');
    });

    it('uses a per-request nonce with strict-dynamic and no unsafe-inline for scripts', () => {
        const csp = buildCsp(prod(), 'abc123');
        const script = csp.split('; ').find((d) => d.startsWith('script-src')) ?? '';
        expect(script).toContain("'nonce-abc123'");
        expect(script).toContain("'strict-dynamic'");
        expect(script).not.toContain('unsafe-inline');
        expect(createNonce()).not.toBe(createNonce());
        expect(createNonce().length).toBeGreaterThanOrEqual(24);
    });

    it('allows the API, GTM/GA, Meta and Turnstile only', () => {
        const csp = buildCsp(prod());
        expect(csp).toContain('https://api.aacpa.sa');
        expect(csp).toContain('https://www.googletagmanager.com');
        expect(csp).toContain('https://connect.facebook.net');
        expect(csp).toContain('https://challenges.cloudflare.com');
        expect(csp).not.toMatch(/script-src[^;]*\*[^.]/);
    });

    it('adds HSTS and upgrade-insecure-requests only in production, not on staging', () => {
        expect(securityHeaders(prod())['strict-transport-security']).toContain('max-age=31536000');
        expect(buildCsp(prod({ CSP_MODE: 'enforce' }))).toContain('upgrade-insecure-requests');
        expect(buildCsp(prod())).not.toContain('upgrade-insecure-requests'); // report-only ignores it and logs an error
        const staging = securityHeaders(prod({ APP_ENV: 'staging' }));
        expect(staging['strict-transport-security']).toBeUndefined();
    });
});
