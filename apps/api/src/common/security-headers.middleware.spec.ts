import type { NextFunction, Request, Response } from 'express';
import { securityHeaders } from './security-headers.middleware';

function run(path: string, production: boolean) {
    const headers: Record<string, string> = {};
    const res = { setHeader: jest.fn((name: string, value: string) => (headers[name] = value)) } as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    securityHeaders({ production })({ path } as Request, res, next);
    return { headers, next };
}

describe('securityHeaders (MUK-473)', () => {
    it('sets the baseline headers and always calls next()', () => {
        const { headers, next } = run('/api/projects', false);
        expect(headers['X-Content-Type-Options']).toBe('nosniff');
        expect(headers['X-Frame-Options']).toBe('DENY');
        expect(headers['Referrer-Policy']).toBe('no-referrer');
        expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
        // The web and admin apps (other origins) load assets from the API.
        expect(headers['Cross-Origin-Resource-Policy']).toBe('cross-origin');
        expect(headers['Content-Security-Policy']).toBe("default-src 'none'; frame-ancestors 'none'");
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('sends HSTS only in production (never pin it on localhost / plain http)', () => {
        expect(run('/api/x', true).headers['Strict-Transport-Security']).toBe('max-age=15552000; includeSubDomains');
        expect(run('/api/x', false).headers).not.toHaveProperty('Strict-Transport-Security');
    });

    it('does not apply the strict CSP to the Swagger UI, which needs inline scripts and styles', () => {
        expect(run('/api/swagger', false).headers).not.toHaveProperty('Content-Security-Policy');
        expect(run('/api/swagger/swagger-ui-bundle.js', true).headers).not.toHaveProperty('Content-Security-Policy');
        // ... but still gets the other headers.
        expect(run('/api/swagger', true).headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('does not mistake a lookalike path for Swagger', () => {
        expect(run('/api/swaggerish', false).headers).toHaveProperty('Content-Security-Policy');
        expect(run('/x/api/swagger', false).headers).toHaveProperty('Content-Security-Policy');
    });
});
