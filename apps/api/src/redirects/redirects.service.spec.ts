import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RedirectsService } from './redirects.service';

describe('RedirectsService', () => {
    let service: RedirectsService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            redirect: {
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                findMany: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                updateMany: jest.fn(),
                delete: jest.fn(),
                deleteMany: jest.fn(),
                upsert: jest.fn(),
                count: jest.fn().mockResolvedValue(0),
            },
            $transaction: jest.fn((cb) => (typeof cb === 'function' ? cb(prisma) : Promise.all(cb))),
        };
        service = new RedirectsService(prisma);
    });

    describe('recordSlugChange', () => {
        it('records a slug change and collapses chained redirects', async () => {
            prisma.redirect.findFirst.mockResolvedValue(null);
            prisma.redirect.findUnique.mockResolvedValue(null);
            prisma.redirect.upsert.mockResolvedValue({
                fromPath: '/services/old-slug',
                toPath: '/services/new-slug',
                type: 'permanent',
                source: 'slug_change',
            });

            await service.recordSlugChange('service', 'old-slug', 'new-slug');

            expect(prisma.redirect.deleteMany).toHaveBeenCalledWith({
                where: { fromPath: '/services/new-slug' },
            });
            expect(prisma.redirect.updateMany).toHaveBeenCalledWith({
                where: { toPath: '/services/old-slug' },
                data: { toPath: '/services/new-slug' },
            });
            expect(prisma.redirect.upsert).toHaveBeenCalledWith({
                where: { fromPath: '/services/old-slug' },
                update: {
                    toPath: '/services/new-slug',
                    type: 'permanent',
                    source: 'slug_change',
                },
                create: {
                    fromPath: '/services/old-slug',
                    toPath: '/services/new-slug',
                    type: 'permanent',
                    source: 'slug_change',
                    createdById: null,
                },
            });
        });

        it('does nothing when fromSlug equals toSlug', async () => {
            await service.recordSlugChange('service', 'same-slug', 'same-slug');
            expect(prisma.redirect.upsert).not.toHaveBeenCalled();
        });
    });

    describe('resolveRedirect', () => {
        it('resolves an existing redirect with statusCode 308', async () => {
            prisma.redirect.findUnique.mockResolvedValue({
                fromPath: '/articles/old-article',
                toPath: '/articles/new-article',
            });

            const res = await service.resolveRedirect('article', 'old-article');
            expect(res).toEqual({
                redirectTo: 'new-article',
                statusCode: 308,
            });
        });

        it('returns null when no redirect exists', async () => {
            prisma.redirect.findUnique.mockResolvedValue(null);
            const res = await service.resolveRedirect('job', 'unknown-job');
            expect(res).toBeNull();
        });
    });

    describe('checkLoop and chain resolution', () => {
        it('rejects self-loop fromPath === toPath', async () => {
            await expect(service.checkLoop('/about', '/about')).rejects.toThrow(BadRequestException);
        });

        it('rejects circular loop A -> B -> A', async () => {
            prisma.redirect.findFirst.mockResolvedValueOnce({
                fromPath: '/b',
                toPath: '/a',
            });

            await expect(service.checkLoop('/a', '/b')).rejects.toThrow(BadRequestException);
        });

        it('resolves terminal destination across chains A -> B -> C', async () => {
            prisma.redirect.findFirst
                .mockResolvedValueOnce({ fromPath: '/b', toPath: '/c' })
                .mockResolvedValueOnce(null);

            const terminal = await service.resolveTerminalDestination('/b');
            expect(terminal).toBe('/c');
        });
    });

    describe('createAdmin', () => {
        it('creates a redirect resolving chains on save', async () => {
            prisma.redirect.count.mockResolvedValue(10);
            prisma.redirect.findUnique.mockResolvedValue(null);
            prisma.redirect.findFirst.mockImplementation(({ where }: any) => {
                if (where?.fromPath === '/b') return Promise.resolve({ fromPath: '/b', toPath: '/c' });
                return Promise.resolve(null);
            });

            prisma.redirect.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'r-1', ...data }));

            const result = await service.createAdmin(
                { fromPath: '/a', toPath: '/b', type: 'permanent' },
                'admin-1',
            );

            expect(result.fromPath).toBe('/a');
            expect(result.toPath).toBe('/c');
            expect(prisma.redirect.updateMany).toHaveBeenCalledWith({
                where: { toPath: '/a' },
                data: { toPath: '/c' },
            });
        });

        it('throws ConflictException if fromPath already exists', async () => {
            prisma.redirect.count.mockResolvedValue(10);
            prisma.redirect.findUnique.mockResolvedValue({ id: 'existing', fromPath: '/a' });

            await expect(
                service.createAdmin({ fromPath: '/a', toPath: '/b', type: 'permanent' }),
            ).rejects.toThrow(ConflictException);
        });

        it('throws BadRequestException if count >= 5000', async () => {
            prisma.redirect.count.mockResolvedValue(5000);

            await expect(
                service.createAdmin({ fromPath: '/new', toPath: '/target', type: 'permanent' }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateAdmin and deleteAdmin', () => {
        it('updates an existing redirect and throws NotFoundException for unknown', async () => {
            prisma.redirect.findUnique.mockResolvedValue(null);
            await expect(
                service.updateAdmin('non-existent', { fromPath: '/x', toPath: '/y' }),
            ).rejects.toThrow(NotFoundException);

            await expect(service.deleteAdmin('non-existent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('public map & export', () => {
        it('returns dictionary map for public web proxy', async () => {
            prisma.redirect.findMany.mockResolvedValue([
                { fromPath: '/old', toPath: '/new', type: 'permanent' },
                { fromPath: '/promo', toPath: '/landing', type: 'temporary' },
            ]);

            const map = await service.getPublicMap();
            expect(map).toEqual({
                '/old': { to: '/new', type: 'permanent' },
                '/promo': { to: '/landing', type: 'temporary' },
            });
        });

        it('exports CSV with sanitized formula cells', async () => {
            prisma.redirect.findMany.mockResolvedValue([
                {
                    fromPath: '/safe',
                    toPath: '=cmd|\' /C calc\'!A0',
                    type: 'permanent',
                    source: 'manual',
                    hits: 5,
                },
            ]);

            const csv = await service.exportCsvAdmin();
            expect(csv).toContain('from,to,type,source,hits');
            expect(csv).toContain("/safe,'=cmd|' /C calc'!A0,permanent,manual,5");
        });
    });

    describe('importCsvAdmin', () => {
        it('rejects empty CSV content', async () => {
            await expect(service.importCsvAdmin('')).rejects.toThrow(BadRequestException);
        });

        it('rejects CSV exceeding capacity limit', async () => {
            prisma.redirect.count.mockResolvedValue(4999);
            const csv = 'from,to,type\n/p1,/t1,permanent\n/p2,/t2,permanent';
            await expect(service.importCsvAdmin(csv)).rejects.toThrow(BadRequestException);
        });

        it('collects row-level errors and aborts all-or-nothing', async () => {
            prisma.redirect.count.mockResolvedValue(0);
            const csv = 'from,to,type\n/valid,/target,permanent\n/same,/same,permanent\n/dup,/target,permanent\n/dup,/other,permanent';
            await expect(service.importCsvAdmin(csv)).rejects.toThrow(BadRequestException);
        });

        it('imports valid rows in transaction and returns counts', async () => {
            prisma.redirect.count.mockResolvedValue(2);
            prisma.redirect.findUnique.mockResolvedValue(null);

            const csv = 'from,to,type\n/legacy-1,/services/audit,permanent\n/legacy-2,/about,temporary';
            const result = await service.importCsvAdmin(csv, 'admin-1');

            expect(result.imported).toBe(2);
            expect(prisma.$transaction).toHaveBeenCalled();
        });
    });
});
