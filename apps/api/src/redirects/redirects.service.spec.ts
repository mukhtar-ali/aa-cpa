import { RedirectsService } from './redirects.service';

describe('RedirectsService', () => {
    let service: RedirectsService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            slugRedirect: {
                upsert: jest.fn(),
                updateMany: jest.fn(),
                deleteMany: jest.fn(),
                findUnique: jest.fn(),
            },
        };
        service = new RedirectsService(prisma);
    });

    it('records a slug change and collapses chained redirects', async () => {
        prisma.slugRedirect.upsert.mockResolvedValue({
            entityType: 'service',
            fromSlug: 'old-slug',
            toSlug: 'new-slug',
        });

        await service.recordSlugChange('service', 'old-slug', 'new-slug');

        expect(prisma.slugRedirect.deleteMany).toHaveBeenCalledWith({
            where: {
                entityType: 'service',
                fromSlug: 'new-slug',
            },
        });
        expect(prisma.slugRedirect.updateMany).toHaveBeenCalledWith({
            where: {
                entityType: 'service',
                toSlug: 'old-slug',
            },
            data: {
                toSlug: 'new-slug',
            },
        });
        expect(prisma.slugRedirect.upsert).toHaveBeenCalledWith({
            where: {
                entityType_fromSlug: {
                    entityType: 'service',
                    fromSlug: 'old-slug',
                },
            },
            update: { toSlug: 'new-slug' },
            create: {
                entityType: 'service',
                fromSlug: 'old-slug',
                toSlug: 'new-slug',
            },
        });
    });

    it('does nothing when fromSlug equals toSlug', async () => {
        await service.recordSlugChange('service', 'same-slug', 'same-slug');
        expect(prisma.slugRedirect.upsert).not.toHaveBeenCalled();
    });

    it('resolves an existing redirect with statusCode 308', async () => {
        prisma.slugRedirect.findUnique.mockResolvedValue({
            entityType: 'article',
            fromSlug: 'old-article',
            toSlug: 'new-article',
        });

        const res = await service.resolveRedirect('article', 'old-article');
        expect(res).toEqual({
            redirectTo: 'new-article',
            statusCode: 308,
        });
    });

    it('returns null when no redirect exists', async () => {
        prisma.slugRedirect.findUnique.mockResolvedValue(null);
        const res = await service.resolveRedirect('job', 'unknown-job');
        expect(res).toBeNull();
    });
});
