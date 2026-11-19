/**
 * CSRF Protection Middleware
 *
 * Double Submit Cookie pattern via `csrf-csrf`, ported from wujud's Express backend —
 * works unchanged here since NestJS's default HTTP adapter *is* Express.
 *
 * This only matters because /api/auth/refresh and /api/auth/logout read a refresh
 * token from an httpOnly cookie the browser attaches automatically; every other route
 * uses a Bearer token in a header (which a malicious site can't attach on a victim's
 * behalf), so CSRF isn't a meaningful risk there — but this guards state-changing
 * requests globally anyway, matching wujud, since a global policy is simpler to reason
 * about than "CSRF only on these two routes."
 */
import { randomBytes } from 'node:crypto';
import { doubleCsrf } from 'csrf-csrf';
import { NextFunction, Request, Response } from 'express';
import { customEnv } from '@/config/custom-env';

/**
 * The CSRF token is bound to a dedicated, random, httpOnly "session" cookie (not to the Authorization
 * header or the IP/User-Agent). The old identifier changed between issuing a token (no Authorization
 * header) and validating it on logout (Bearer header attached), so every logout failed with
 * CSRF_INVALID_TOKEN (MUK-466). This cookie is stable across both requests, does not rotate with the
 * refresh token, and survives IP changes.
 */
// In production both CSRF cookies use the `__Host-` prefix: browsers then refuse to let a sibling
// subdomain (or an insecure origin) set or overwrite them ("cookie tossing"), which would otherwise
// let an attacker plant a CSRF token/session pair they obtained for their own session. The prefix
// requires Secure, Path=/ and no Domain attribute, all of which these cookies already use. It cannot
// be used over plain http (local development), so it is production-only.
const COOKIE_PREFIX = process.env.NODE_ENV === 'production' ? '__Host-' : '';
export const CSRF_SESSION_COOKIE = `${COOKIE_PREFIX}csrf_sid`;
export const CSRF_TOKEN_COOKIE = `${COOKIE_PREFIX}x-csrf-token`;
const CSRF_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
// 32 random bytes, base64url-encoded.
const CSRF_SESSION_ID_FORMAT = /^[A-Za-z0-9_-]{43}$/;
// Used when a request has no valid session cookie. It is random per process and never handed out, so no
// token can ever have been issued for it and such requests can never validate.
const NO_SESSION_IDENTIFIER = randomBytes(32).toString('hex');

function readCsrfSessionId(req: Request): string | undefined {
    const value = (req.cookies as Record<string, unknown> | undefined)?.[CSRF_SESSION_COOKIE];
    return typeof value === 'string' && CSRF_SESSION_ID_FORMAT.test(value) ? value : undefined;
}

const { invalidCsrfTokenError, generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => customEnv.CSRF_SECRET,
    getSessionIdentifier: (req: Request) => readCsrfSessionId(req) ?? NO_SESSION_IDENTIFIER,
    cookieName: CSRF_TOKEN_COOKIE,
    cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'] as string,
});

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
    doubleCsrfProtection(req, res, (err: unknown) => {
        if (err === invalidCsrfTokenError) {
            res.status(403).json({
                statusCode: 403,
                message: 'CSRF validation failed. Please refresh and try again.',
                code: 'CSRF_INVALID_TOKEN',
            });
            return;
        }
        next(err as Error | undefined);
    });
}

export function issueCsrfToken(req: Request, res: Response) {
    // Make sure the browser has a session cookie BEFORE the token is generated, because the token is
    // bound to it. (Also repairs browsers whose previous token was bound to the old identifier: the
    // library replaces an existing cookie that no longer validates.)
    if (!readCsrfSessionId(req)) {
        const sessionId = randomBytes(32).toString('base64url');
        res.cookie(CSRF_SESSION_COOKIE, sessionId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: CSRF_SESSION_MAX_AGE_MS,
        });
        req.cookies = { ...(req.cookies as Record<string, unknown> | undefined), [CSRF_SESSION_COOKIE]: sessionId };
    }
    const token = generateCsrfToken(req, res);
    return res.json({ csrfToken: token });
}
