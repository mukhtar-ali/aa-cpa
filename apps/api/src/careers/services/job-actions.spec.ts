import { GetAllJobsService } from './get-all-jobs.service';
import { JobDepartmentsService } from '../departments/job-departments.service';

describe('Careers / Job Actions & Filters', () => {
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            job: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                count: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            jobDepartment: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                count: jest.fn(),
            },
            $transaction: jest.fn((cbOrArr) => (Array.isArray(cbOrArr) ? Promise.all(cbOrArr) : cbOrArr(mockPrisma))),
        };
    });

    describe('GetAllJobsService filters', () => {
        it('applies open-only (closesAt > now or null) filter on web list', async () => {
            const service = new GetAllJobsService(mockPrisma);
            mockPrisma.job.findMany.mockResolvedValue([]);
            mockPrisma.job.count.mockResolvedValue(0);

            await service.execute({} as any, true);

            expect(mockPrisma.job.findMany).toHaveBeenCalled();
            const callArgs = mockPrisma.job.findMany.mock.calls[0][0];
            expect(callArgs.where.isPublished).toBe(true);
            expect(callArgs.where.isDeleted).toBe(false);
            expect(callArgs.where.OR).toBeDefined();
        });

        it('filters by departmentId or department slug', async () => {
            const service = new GetAllJobsService(mockPrisma);
            mockPrisma.job.findMany.mockResolvedValue([]);
            mockPrisma.job.count.mockResolvedValue(0);

            await service.execute({ department: 'audit' } as any, true);

            const callArgs = mockPrisma.job.findMany.mock.calls[0][0];
            expect(callArgs.where.department).toEqual({ slug: 'audit' });
        });
    });

    describe('JobDepartmentsService', () => {
        it('creates a job department', async () => {
            const service = new JobDepartmentsService(mockPrisma);
            mockPrisma.jobDepartment.create.mockResolvedValue({
                id: 'dept-1',
                slug: 'tax',
                name: { ar: 'الضرائب', en: 'Tax' },
                order: 0,
            });

            const result = await service.create({
                slug: 'tax',
                name: { ar: 'الضرائب', en: 'Tax' },
                order: 0,
            });

            expect(result.id).toBe('dept-1');
            expect(result.slug).toBe('tax');
        });

        it('prevents deletion if department has jobs', async () => {
            const service = new JobDepartmentsService(mockPrisma);
            mockPrisma.jobDepartment.findUnique.mockResolvedValue({ id: 'dept-1', isDeleted: false });
            mockPrisma.job.count.mockResolvedValue(2);

            await expect(service.delete('dept-1')).rejects.toThrow();
        });
    });
});
