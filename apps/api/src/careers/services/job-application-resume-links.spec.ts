import { GetAllJobApplicationsService } from './get-all-job-applications.service';
import { GetJobApplicationByIdService } from './get-job-application-by-id.service';

// Résumés are private objects (MUK-482): the admin API swaps the stored URL for a short-lived signed link.

const row = (id: string, resumeUrl: string | null) => ({
    id, jobId: 'j1', firstName: 'A', lastName: 'B', email: 'a@b.co', phone: null, coverLetter: null, resumeUrl, notes: null,
    status: 'pending', createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
    job: { slug: 'dev', translations: [{ language: 'en', title: 'Dev' }, { language: 'ar', title: 'م' }] },
});

describe('job application résumé links', () => {
    const resources = { signedReadUrlOrOriginal: jest.fn(async (url: string) => `${url}?signed=1`) };
    beforeEach(() => resources.signedReadUrlOrOriginal.mockClear());

    it('the list returns signed links and skips applications without a résumé', async () => {
        const prisma = {
            jobApplication: {
                findMany: jest.fn().mockResolvedValue([row('1', 'https://b.s3.amazonaws.com/nest-next-starter/uploads/d/a.pdf'), row('2', null)]),
                count: jest.fn().mockResolvedValue(2),
            },
        };
        const result = await new GetAllJobApplicationsService(prisma as never, resources as never).execute({ pageNumber: 1, pageSize: 10 } as never);
        expect(result.items[0].resumeUrl).toBe('https://b.s3.amazonaws.com/nest-next-starter/uploads/d/a.pdf?signed=1');
        expect(result.items[1].resumeUrl).toBeUndefined();
        expect(resources.signedReadUrlOrOriginal).toHaveBeenCalledTimes(1);
    });

    it('the detail returns a signed link', async () => {
        const prisma = { jobApplication: { findUnique: jest.fn().mockResolvedValue(row('1', 'https://b.s3.amazonaws.com/nest-next-starter/uploads/d/a.pdf')) } };
        const result = await new GetJobApplicationByIdService(prisma as never, resources as never).execute('1');
        expect(result.resumeUrl).toMatch(/\?signed=1$/);
    });
});
