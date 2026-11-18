import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PageContentService } from './page-content.service';

describe('PageContentService', () => {
    const make = (seo: unknown, section: unknown) =>
        new PageContentService({ getByPageKey: seo } as never, { getSection: section } as never);

    it('returns the saved SEO content, or null when the page has none or the lookup fails', async () => {
        const content = { title: { en: 'Projects', ar: '' } };
        expect(await make(jest.fn().mockResolvedValue({ content }), jest.fn()).getSeo('projects')).toBe(content);
        expect(await make(jest.fn().mockResolvedValue(null), jest.fn()).getSeo('projects')).toBeNull();
        expect(await make(jest.fn().mockRejectedValue(new Error('db')), jest.fn()).getSeo('projects')).toBeNull();
    });

    it('falls back when a CMS section was never saved', async () => {
        const missing = jest.fn().mockRejectedValue(new Error('not found'));
        expect(await make(jest.fn(), missing).getSection('projects-hero')).toBeNull();
        expect(await make(jest.fn(), missing).getSection('x', { items: [] })).toEqual({ items: [] });
    });

    it('clamps the public page size', () => {
        const service = make(jest.fn(), jest.fn());
        expect(service.clampPageSize(undefined)).toBe(DEFAULT_PAGE_SIZE);
        expect(service.clampPageSize(0)).toBe(DEFAULT_PAGE_SIZE);
        expect(service.clampPageSize(-5)).toBe(DEFAULT_PAGE_SIZE);
        expect(service.clampPageSize(6)).toBe(6);
        expect(service.clampPageSize(100000)).toBe(MAX_PAGE_SIZE);
    });
});
