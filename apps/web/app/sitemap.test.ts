import { describe, expect, it, vi } from 'vitest';
import * as client from '@/src/lib/api/client';
import sitemap from './sitemap';

describe('sitemap', () => {
    it('generates entries for all static pages in both languages with alternates incl x-default', async () => {
        vi.spyOn(client, 'apiGet').mockResolvedValue([]);
        const result = await sitemap();

        const homeAr = result.find((item) => item.url === 'http://localhost:3000/ar');
        expect(homeAr).toBeDefined();
        expect(homeAr?.priority).toBe(1);
        expect(homeAr?.alternates?.languages).toEqual({
            ar: 'http://localhost:3000/ar',
            en: 'http://localhost:3000/en',
            'x-default': 'http://localhost:3000/ar',
        });

        const aboutEn = result.find((item) => item.url === 'http://localhost:3000/en/about');
        expect(aboutEn).toBeDefined();
        expect(aboutEn?.priority).toBe(0.8);
        expect(aboutEn?.alternates?.languages).toEqual({
            ar: 'http://localhost:3000/ar/about',
            en: 'http://localhost:3000/en/about',
            'x-default': 'http://localhost:3000/ar/about',
        });
    });

    it('filters out draft and noindex items and reads lastModified from updatedAt', async () => {
        vi.spyOn(client, 'apiGet').mockImplementation(async (path: string) => {
            if (path.includes('services')) {
                return [
                    { slug: 'audit', updatedAt: '2026-02-10T12:00:00Z' },
                    { slug: 'secret-service', draft: true },
                    { slug: 'hidden-service', noindex: true },
                    { slug: 'seo-noindex', seo: { noindex: true } },
                ];
            }
            if (path.includes('articles') || path.includes('news')) {
                return [
                    { slug: 'vat-guide', updatedAt: '2026-03-01T00:00:00Z' },
                    { slug: 'draft-article', status: 'draft' },
                ];
            }
            if (path.includes('jobs') || path.includes('careers')) {
                return [
                    { slug: 'auditor', updatedAt: '2026-01-20T00:00:00Z' },
                    { slug: 'draft-job', isDraft: true },
                ];
            }
            return [];
        });

        const result = await sitemap();

        // Audit service should exist
        const auditAr = result.find((item) => item.url === 'http://localhost:3000/ar/services/audit');
        expect(auditAr).toBeDefined();
        expect(auditAr?.lastModified).toEqual(new Date('2026-02-10T12:00:00Z'));
        expect(auditAr?.priority).toBe(0.7);

        // Draft and noindex items must NOT be included
        expect(result.some((item) => item.url.includes('secret-service'))).toBe(false);
        expect(result.some((item) => item.url.includes('hidden-service'))).toBe(false);
        expect(result.some((item) => item.url.includes('seo-noindex'))).toBe(false);
        expect(result.some((item) => item.url.includes('draft-article'))).toBe(false);
        expect(result.some((item) => item.url.includes('draft-job'))).toBe(false);
    });
});
