import { describe, expect, it } from 'vitest';
import { matchRedirect, normalizePath } from './redirects';

describe('redirect lookup', () => {
    it('normalises case, trailing slash, query and fragment', () => {
        expect(normalizePath('/About-Us/?a=1#x')).toBe('/about-us');
        expect(normalizePath('/')).toBe('/');
    });

    it('matches permanent as 308 and temporary as 307, and misses unknown paths', () => {
        const map = { '/a': { to: '/ar/a', type: 'permanent' as const }, '/b': { to: '/ar/b', type: 'temporary' as const } };
        expect(matchRedirect(map, '/a', '?q=1')).toEqual({ key: '/a', location: '/ar/a?q=1', status: 308 });
        expect(matchRedirect(map, '/B/')?.status).toBe(307);
        expect(matchRedirect(map, '/c')).toBeNull();
    });

    it('matches locale-free entries under a locale prefix and keeps the visitor language', () => {
        const map = { '/services/old': { to: '/services/new', type: 'permanent' as const }, '/ar/x': { to: '/ar/y', type: 'permanent' as const } };
        expect(matchRedirect(map, '/en/services/old')).toEqual({ key: '/services/old', location: '/en/services/new', status: 308 });
        expect(matchRedirect(map, '/ar/x')?.location).toBe('/ar/y');
        expect(matchRedirect(map, '/en/services/other')).toBeNull();
    });
});
