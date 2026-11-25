import { NotFoundException } from '@nestjs/common';
import { computeOgContentHash } from './og.hash';
import { escapeXml, wrapTitle } from './og.template';
import { OgService } from './og.service';

describe('OgService & Helpers', () => {
    describe('Hash Stability', () => {
        it('returns identical hash for identical payloads', () => {
            const payload = {
                type: 'page',
                key: 'home',
                lang: 'ar',
                title: 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية',
                eyebrow: 'بوابة الشركة',
            };

            const hash1 = computeOgContentHash(payload);
            const hash2 = computeOgContentHash({ ...payload });

            expect(hash1).toBe(hash2);
            expect(hash1).toMatch(/^[a-f0-9]{64}$/);
        });

        it('normalizes whitespace and language casing', () => {
            const h1 = computeOgContentHash({
                type: 'service',
                key: 'audit',
                lang: 'ar',
                title: 'خدمات المراجعة',
            });
            const h2 = computeOgContentHash({
                type: 'service ',
                key: ' audit',
                lang: 'AR',
                title: 'خدمات المراجعة ',
            });

            expect(h1).toBe(h2);
        });

        it('changes hash when any content field changes', () => {
            const base = {
                type: 'page',
                key: 'about',
                lang: 'ar',
                title: 'من نحن',
                eyebrow: 'بوابة الشركة',
            };
            const baseHash = computeOgContentHash(base);

            expect(computeOgContentHash({ ...base, key: 'contact' })).not.toBe(baseHash);
            expect(computeOgContentHash({ ...base, lang: 'en' })).not.toBe(baseHash);
            expect(computeOgContentHash({ ...base, title: 'من نحن - نبذة' })).not.toBe(baseHash);
            expect(computeOgContentHash({ ...base, eyebrow: 'خدمات' })).not.toBe(baseHash);
            expect(computeOgContentHash({ ...base, type: 'article' })).not.toBe(baseHash);
        });
    });

    describe('Title Wrapping & XML Escaping', () => {
        it('keeps short titles on a single line', () => {
            const lines = wrapTitle('من نحن', 32, 3);
            expect(lines).toEqual(['من نحن']);
        });

        it('wraps long titles cleanly at word boundaries', () => {
            const longTitle = 'المراجعة والتدقيق المالي الشامل للشركات والمؤسسات التجارية وفق معايير المحاسبة السعودية';
            const lines = wrapTitle(longTitle, 30, 3);

            expect(lines.length).toBeGreaterThan(1);
            expect(lines.length).toBeLessThanOrEqual(3);
            for (const line of lines) {
                expect(line.length).toBeLessThanOrEqual(36);
            }
        });

        it('truncates very long titles with an ellipsis when exceeding maxLines', () => {
            const veryLong =
                'كلمة أولى ثانية ثالثة رابعة خامسة سادسة سابعة ثامنة تاسعة عاشرة حادية عشرة ثانية عشرة ثالثة عشرة رابعة عشرة خامسة عشرة سادسة عشرة سابعة عشرة ثامنة عشرة';
            const lines = wrapTitle(veryLong, 20, 2);

            expect(lines.length).toBe(2);
            expect(lines[1]).toMatch(/…$/);
        });

        it('escapes XML entities in title and text', () => {
            expect(escapeXml('Audit & Advisory <Special> "Top" \'SOCPA\'')).toBe(
                'Audit &amp; Advisory &lt;Special&gt; &quot;Top&quot; &apos;SOCPA&apos;',
            );
        });
    });

    describe('Unknown Key Handling', () => {
        let ogService: OgService;
        let mockPrisma: any;

        beforeEach(() => {
            mockPrisma = {
                seo: { findUnique: jest.fn().mockResolvedValue(null) },
                service: { findFirst: jest.fn().mockResolvedValue(null) },
                news: { findFirst: jest.fn().mockResolvedValue(null) },
                job: { findFirst: jest.fn().mockResolvedValue(null) },
            };
            ogService = new OgService(mockPrisma);
        });

        it('throws NotFoundException for unknown page key', async () => {
            await expect(ogService.resolveContent('page', 'non-existent-page-key', 'ar')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('throws NotFoundException for unknown service slug', async () => {
            await expect(ogService.resolveContent('service', 'unknown-service-slug', 'ar')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('throws NotFoundException for unknown article slug', async () => {
            await expect(ogService.resolveContent('article', 'unknown-article-slug', 'ar')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('throws NotFoundException for unknown job slug', async () => {
            await expect(ogService.resolveContent('job', 'unknown-job-slug', 'ar')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('resolves known built-in pages without DB record', async () => {
            const res = await ogService.resolveContent('page', 'about', 'ar');
            expect(res.title).toBe('من نحن');
            expect(res.eyebrow).toBe('بوابة الشركة');
        });

        it('resolves service when found in DB', async () => {
            mockPrisma.service.findFirst.mockResolvedValue({
                id: '1',
                slug: 'audit',
                translations: [{ language: 'ar', title: 'خدمات المراجعة المالية' }],
            });

            const res = await ogService.resolveContent('service', 'audit', 'ar');
            expect(res.title).toBe('خدمات المراجعة المالية');
            expect(res.eyebrow).toBe('خدماتنا');
        });
    });

    describe('Render and Disk Caching', () => {
        it('renders a valid PNG buffer and deterministic hash', async () => {
            const mockPrisma = {
                seo: { findUnique: jest.fn().mockResolvedValue(null) },
                service: { findFirst: jest.fn().mockResolvedValue(null) },
                news: { findFirst: jest.fn().mockResolvedValue(null) },
                job: { findFirst: jest.fn().mockResolvedValue(null) },
            };
            const ogService = new OgService(mockPrisma as any);

            const result = await ogService.render({
                type: 'page',
                key: 'home',
                lang: 'ar',
            });

            expect(result.buffer).toBeInstanceOf(Buffer);
            expect(result.buffer.length).toBeGreaterThan(1000);
            expect(result.hash).toMatch(/^[a-f0-9]{64}$/);

            // Second render should read from disk cache
            const second = await ogService.render({
                type: 'page',
                key: 'home',
                lang: 'ar',
            });
            expect(second.hash).toBe(result.hash);
            expect(second.buffer.length).toBe(result.buffer.length);
        });
    });
});
