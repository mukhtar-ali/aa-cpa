import { afterEach, describe, expect, it } from 'vitest';
import robots from './robots';

describe('robots', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    it('allows indexing on production except for /api/ and /*/reference/', () => {
        process.env = { ...originalEnv, APP_ENV: 'production' };
        const result = robots();
        expect(result.rules).toEqual({
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/*/reference/'],
        });
        expect(result.sitemap).toBe('http://localhost:3000/sitemap.xml');
    });

    it('disallows all indexing when APP_ENV is staging or preview or not production', () => {
        process.env = { ...originalEnv, APP_ENV: 'staging' };
        expect(robots().rules).toEqual({
            userAgent: '*',
            disallow: '/',
        });

        process.env = { ...originalEnv, APP_ENV: 'development' };
        expect(robots().rules).toEqual({
            userAgent: '*',
            disallow: '/',
        });

        delete process.env.APP_ENV;
        expect(robots().rules).toEqual({
            userAgent: '*',
            disallow: '/',
        });
    });
});
