import { afterEach, describe, expect, it } from 'vitest';
import { buildOgImageUrl } from './og';

describe('buildOgImageUrl', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    it('builds standard OG image URL with defaults', () => {
        const url = buildOgImageUrl({ lang: 'ar' });
        expect(url).toBe('http://localhost:3001/api/og?type=page&key=home&lang=ar');
    });

    it('respects custom type and key', () => {
        const url = buildOgImageUrl({ type: 'article', key: 'zakat-guide', lang: 'en' });
        expect(url).toBe('http://localhost:3001/api/og?type=article&key=zakat-guide&lang=en');
    });

    it('uses NEXT_PUBLIC_API_URL if configured', () => {
        process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: 'https://api.aacpa.sa' };
        const url = buildOgImageUrl({ type: 'service', key: 'audit', lang: 'ar' });
        expect(url).toBe('https://api.aacpa.sa/api/og?type=service&key=audit&lang=ar');
    });
});
