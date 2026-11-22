import type { NextFunction, Request, Response } from 'express';

// The Swagger UI page and its assets (/api/swagger, /api/swagger/...) but not lookalikes such as /api/swaggerish.
const SWAGGER_UI_PATH = /^\/api\/swagger(\/|$)/;

/**
 * Baseline security headers for the API (a small, dependency-free subset of what `helmet` sets).
 * The API serves JSON, uploaded-asset URLs and the Swagger UI, never pages that should be framed or
 * sniffed, so the policy is strict:
 *  - nosniff, DENY framing, no referrer, cross-origin-opener isolation;
 *  - CORP `cross-origin` because the web and admin apps (other origins) load assets from here;
 *  - HSTS only in production (browsers ignore it over plain HTTP, and it must never be pinned on localhost);
 *  - a `default-src 'none'` CSP for everything except the Swagger UI, which needs inline scripts/styles.
 */
export function securityHeaders(options: { production: boolean } = { production: process.env.NODE_ENV === 'production' }) {
    return (req: Request, res: Response, next: NextFunction): void => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        if (options.production) {
            res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
        }
        if (!SWAGGER_UI_PATH.test(req.path ?? '')) {
            res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
        }
        next();
    };
}
