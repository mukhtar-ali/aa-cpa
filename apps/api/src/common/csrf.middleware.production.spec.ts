import type { Request, Response } from 'express';

/**
 * In production the CSRF cookies must carry the `__Host-` prefix (browsers refuse to let a sibling
 * subdomain overwrite them) and therefore must be Secure, Path=/ and have no Domain.
 * The module reads NODE_ENV once at import time, so load a fresh copy under NODE_ENV=production.
 */
describe('csrf.middleware in production', () => {
    const originalEnv = process.env.NODE_ENV;
    let mod: typeof import('./csrf.middleware');

    beforeAll(() => {
        process.env.NODE_ENV = 'production';
        jest.isolateModules(() => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            mod = require('./csrf.middleware');
        });
    });

    afterAll(() => {
        process.env.NODE_ENV = originalEnv;
    });

    it('uses __Host- prefixed cookie names', () => {
        expect(mod.CSRF_SESSION_COOKIE).toBe('__Host-csrf_sid');
        expect(mod.CSRF_TOKEN_COOKIE).toBe('__Host-x-csrf-token');
    });

    it('sets both cookies Secure, httpOnly, Path=/ and WITHOUT a Domain (required by the __Host- prefix)', () => {
        const options: Record<string, Record<string, unknown>> = {};
        const req = { method: 'GET', headers: {}, cookies: {}, ip: '127.0.0.1' } as unknown as Request;
        const res = {
            cookie: jest.fn((name: string, _value: string, opts: Record<string, unknown>) => {
                options[name] = opts;
                return res;
            }),
            json: jest.fn().mockReturnThis(),
        } as unknown as Response;

        mod.issueCsrfToken(req, res);

        for (const name of ['__Host-csrf_sid', '__Host-x-csrf-token']) {
            expect(options[name]).toEqual(expect.objectContaining({ secure: true, httpOnly: true, path: '/' }));
            expect(options[name]).not.toHaveProperty('domain');
        }
    });

    it('accepts a token whose cookies use the prefixed names and rejects the unprefixed ones', () => {
        const cookiesSet: Record<string, string> = {};
        const issueReq = { method: 'GET', headers: {}, cookies: {}, ip: '127.0.0.1' } as unknown as Request;
        let token = '';
        const issueRes = {
            cookie: jest.fn((name: string, value: string) => {
                cookiesSet[name] = value;
                return issueRes;
            }),
            json: jest.fn((body: { csrfToken: string }) => {
                token = body.csrfToken;
                return issueRes;
            }),
        } as unknown as Response;
        mod.issueCsrfToken(issueReq, issueRes);

        const run = (cookies: Record<string, string>) => {
            const next = jest.fn();
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
            mod.csrfProtection(
                { method: 'POST', url: '/api/auth/logout', headers: { 'x-csrf-token': token }, cookies, ip: '127.0.0.1' } as unknown as Request,
                res,
                next,
            );
            return { next, res };
        };

        const ok = run({ '__Host-x-csrf-token': cookiesSet['__Host-x-csrf-token'], '__Host-csrf_sid': cookiesSet['__Host-csrf_sid'] });
        expect(ok.next).toHaveBeenCalledWith(undefined);

        // A planted cookie with the OLD (unprefixed) names is simply ignored.
        const planted = run({ 'x-csrf-token': cookiesSet['__Host-x-csrf-token'], csrf_sid: cookiesSet['__Host-csrf_sid'] });
        expect(planted.next).not.toHaveBeenCalled();
        expect(planted.res.status).toHaveBeenCalledWith(403);
    });
});
