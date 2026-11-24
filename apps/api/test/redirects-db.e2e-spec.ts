import { PrismaService } from '@/prisma/prisma.service';
import { RedirectsService } from '@/redirects/redirects.service';

/**
 * RedirectsService against the REAL database (the other redirects e2e mocks Prisma): unique keys, the chain/loop rules and the
 * all-or-nothing CSV import only mean something with real SQL behind them.
 */
describe('RedirectsService on a real database', () => {
    const prisma = new PrismaService();
    const service = new RedirectsService(prisma);

    beforeAll(async () => {
        await prisma.$connect();
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });
    beforeEach(async () => {
        await prisma.redirect.deleteMany();
    });

    const pathsOf = async () => Object.fromEntries((await prisma.redirect.findMany()).map((r) => [r.fromPath, r.toPath]));

    it('stores a redirect and serves it in the public map with its type', async () => {
        await service.createAdmin({ fromPath: '/Old-About/', toPath: '/ar/about', type: 'permanent' });
        const map = await service.getPublicMap();
        expect(map['/old-about']).toEqual({ to: '/ar/about', type: 'permanent' });
    });

    it('rejects a duplicate from-path and a self redirect', async () => {
        await service.createAdmin({ fromPath: '/a', toPath: '/ar/a' });
        await expect(service.createAdmin({ fromPath: '/a', toPath: '/ar/b' })).rejects.toThrow(/already exists/);
        await expect(service.createAdmin({ fromPath: '/x', toPath: '/x' })).rejects.toThrow();
    });

    it('collapses chains on save in both directions (A->B then B->C leaves A->C)', async () => {
        await service.createAdmin({ fromPath: '/a', toPath: '/b' });
        await service.createAdmin({ fromPath: '/b', toPath: '/c' });
        expect(await pathsOf()).toEqual({ '/a': '/c', '/b': '/c' });
        await service.createAdmin({ fromPath: '/z', toPath: '/a' });
        expect((await pathsOf())['/z']).toBe('/c');
    });

    it('rejects a redirect that would close a loop', async () => {
        await service.createAdmin({ fromPath: '/a', toPath: '/b' });
        await expect(service.createAdmin({ fromPath: '/c', toPath: '/c-x' })).resolves.toBeDefined();
        await expect(service.createAdmin({ fromPath: '/b', toPath: '/a' })).rejects.toThrow();
    });

    it('a slug renamed back removes the redirect from the live path (no redirect loop on a live page)', async () => {
        await service.recordSlugChange('service', 'old', 'new');
        expect(await pathsOf()).toEqual({ '/services/old': '/services/new' });
        await service.recordSlugChange('service', 'new', 'old');
        const paths = await pathsOf();
        expect(paths['/services/old']).toBeUndefined();
        expect(paths['/services/new']).toBe('/services/old');
    });

    it('consecutive renames keep every old slug one hop from the current one', async () => {
        await service.recordSlugChange('article', 'a', 'b');
        await service.recordSlugChange('article', 'b', 'c');
        expect(await pathsOf()).toEqual({ '/articles/a': '/articles/c', '/articles/b': '/articles/c' });
    });

    it('CSV import is all-or-nothing and names the failing rows', async () => {
        const bad = 'from,to,type\n/ok-1,/ar/one,permanent\n/ok-2,,permanent\n/ok-3,/ar/three,permanent';
        await expect(service.importCsvAdmin(bad)).rejects.toMatchObject({ response: { errors: [expect.objectContaining({ row: 3 })] } });
        expect(await prisma.redirect.count()).toBe(0);

        const good = 'from,to,type\n/ok-1,/ar/one,permanent\n/ok-2,/ar/two,temporary';
        await expect(service.importCsvAdmin(good)).resolves.toMatchObject({ imported: 2 });
        const rows = await prisma.redirect.findMany({ orderBy: { fromPath: 'asc' } });
        expect(rows.map((r) => [r.fromPath, r.type])).toEqual([['/ok-1', 'permanent'], ['/ok-2', 'temporary']]);
    });

    it('CSV import rejects loops inside the batch', async () => {
        await expect(service.importCsvAdmin('from,to\n/a,/b\n/b,/a')).rejects.toThrow();
        expect(await prisma.redirect.count()).toBe(0);
    });

    it('CSV export neutralises spreadsheet formulas', async () => {
        await prisma.redirect.create({ data: { fromPath: '/=cmd', toPath: '/ar/x', type: 'permanent', source: 'manual' } });
        const csv = await service.exportCsvAdmin();
        expect(csv.split('\n')[1].startsWith("'/=cmd")).toBe(false); // starts with "/" so it is not a formula start
        await prisma.redirect.create({ data: { fromPath: '/y', toPath: '=HYPERLINK("http://evil")', type: 'permanent', source: 'manual' } });
        const csv2 = await service.exportCsvAdmin();
        expect(csv2).toContain(`'=HYPERLINK`);
    });

    it('counts hits in batches, only for existing redirects, and keeps the count across flushes', async () => {
        await service.createAdmin({ fromPath: '/hot', toPath: '/ar/hot' });
        service.recordHit('/Hot/');
        service.recordHit('/hot');
        service.recordHit('/never-created');
        expect(await service.flushHits()).toBe(1);
        service.recordHit('/hot');
        await service.flushHits();
        const row = await prisma.redirect.findUniqueOrThrow({ where: { fromPath: '/hot' } });
        expect(row.hits).toBe(3);
        expect(row.lastHitAt).not.toBeNull();
        expect(await prisma.redirect.count({ where: { fromPath: '/never-created' } })).toBe(0);
    });

    it('asks the web app to drop its cached map after every change', async () => {
        const pending = () => prisma.emailOutbox.count({ where: { kind: 'revalidate', status: 'pending' } });
        await prisma.emailOutbox.deleteMany({ where: { kind: 'revalidate' } });
        const created = await service.createAdmin({ fromPath: '/r1', toPath: '/ar/r1' });
        expect(await pending()).toBe(1);
        await service.updateAdmin(created.id, { fromPath: '/r1', toPath: '/ar/r1b' });
        await service.deleteAdmin(created.id);
        await service.importCsvAdmin('from,to\n/r2,/ar/r2');
        await service.recordSlugChange('job', 'a', 'b');
        expect(await pending()).toBe(5);
        const row = await prisma.emailOutbox.findFirstOrThrow({ where: { kind: 'revalidate' } });
        expect(row.payload).toEqual({ tags: ['redirects'] });
    });
});
