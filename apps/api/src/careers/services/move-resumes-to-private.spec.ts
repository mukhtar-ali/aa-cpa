import { moveResumesToPrivate } from './move-resumes-to-private';

const UP = 'nest-next-starter/uploads/2026-01-01/aaa-cv.pdf';
const PRIV = 'nest-next-starter/private/2026-01-02/bbb-cv.pdf';

const harness = (rows: { id: string; resumeUrl: string | null }[], overrides: Record<string, jest.Mock> = {}) => {
    const calls: string[] = [];
    const prisma = {
        jobApplication: {
            findMany: jest.fn().mockResolvedValue(rows),
            update: jest.fn(async ({ where, data }: { where: { id: string }; data: { resumeUrl: string } }) => void calls.push(`db:${where.id}:${data.resumeUrl}`)),
        },
    };
    const resources = {
        keyFromStoredUrl: jest.fn((url: string) => (url.startsWith('https://b.s3.amazonaws.com/') ? url.slice('https://b.s3.amazonaws.com/'.length) : undefined)),
        urlForKey: jest.fn((key: string) => `https://b.s3.amazonaws.com/${key}`),
        copyObject: jest.fn(async (from: string, to: string) => void calls.push(`copy:${from}->${to}`)),
        deleteObject: jest.fn(async (key: string) => void calls.push(`delete:${key}`)),
        ...overrides,
    };
    return { prisma, resources, calls };
};
const url = (key: string) => `https://b.s3.amazonaws.com/${key}`;

describe('moveResumesToPrivate (MUK-482)', () => {
    it('dry run reports what would move and changes nothing', async () => {
        const { prisma, resources, calls } = harness([{ id: '1', resumeUrl: url(UP) }]);
        const summary = await moveResumesToPrivate({ prisma, resources, apply: false });
        expect(summary).toMatchObject({ total: 1, moved: 1, failed: 0 });
        expect(calls).toEqual([]);
        expect(prisma.jobApplication.update).not.toHaveBeenCalled();
    });

    it('moves in the safe order: copy, repoint the row, THEN delete the original', async () => {
        const { prisma, resources, calls } = harness([{ id: '1', resumeUrl: url(UP) }]);
        const summary = await moveResumesToPrivate({ prisma, resources, apply: true });
        expect(summary).toMatchObject({ moved: 1, failed: 0, originalsNotDeleted: [] });
        expect(calls).toEqual([
            `copy:${UP}->nest-next-starter/private/2026-01-01/aaa-cv.pdf`,
            `db:1:${url('nest-next-starter/private/2026-01-01/aaa-cv.pdf')}`,
            `delete:${UP}`,
        ]);
    });

    it('leaves already-private rows and URLs that are not ours alone (re-runnable)', async () => {
        const { prisma, resources, calls } = harness([
            { id: '1', resumeUrl: url(PRIV) },
            { id: '2', resumeUrl: 'https://elsewhere.example.com/cv.pdf' },
            { id: '3', resumeUrl: url('some/other/key.pdf') },
        ]);
        const summary = await moveResumesToPrivate({ prisma, resources, apply: true });
        expect(summary).toMatchObject({ total: 3, alreadyPrivate: 1, foreign: 2, moved: 0, failed: 0 });
        expect(calls).toEqual([]);
    });

    it('a failed copy leaves the row and the original untouched and does not stop the other rows', async () => {
        const copyObject = jest.fn().mockRejectedValueOnce(new Error('AccessDenied')).mockResolvedValue(undefined);
        const { prisma, resources } = harness(
            [{ id: '1', resumeUrl: url(UP) }, { id: '2', resumeUrl: url('nest-next-starter/uploads/2026-01-03/ccc-cv.pdf') }],
            { copyObject },
        );
        const summary = await moveResumesToPrivate({ prisma, resources, apply: true });
        expect(summary).toMatchObject({ moved: 1, failed: 1 });
        expect(prisma.jobApplication.update).toHaveBeenCalledTimes(1);
        expect(prisma.jobApplication.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: '2' } }));
        expect(resources.deleteObject).toHaveBeenCalledTimes(1);
    });

    it('a failed database update keeps the original (nothing is deleted)', async () => {
        const { prisma, resources } = harness([{ id: '1', resumeUrl: url(UP) }]);
        prisma.jobApplication.update.mockRejectedValueOnce(new Error('db down'));
        const summary = await moveResumesToPrivate({ prisma, resources, apply: true });
        expect(summary).toMatchObject({ moved: 0, failed: 1 });
        expect(resources.deleteObject).not.toHaveBeenCalled();
    });

    it('a failed delete is reported loudly: the row is moved but the public original must be removed by hand', async () => {
        const logs: string[] = [];
        const { prisma, resources } = harness([{ id: '1', resumeUrl: url(UP) }], { deleteObject: jest.fn().mockRejectedValue(new Error('AccessDenied')) });
        const summary = await moveResumesToPrivate({ prisma, resources, apply: true, log: (m) => logs.push(m) });
        expect(summary).toMatchObject({ moved: 1, failed: 0, originalsNotDeleted: [UP] });
        expect(logs.some((l) => /STILL PUBLIC/.test(l))).toBe(true);
    });
});
