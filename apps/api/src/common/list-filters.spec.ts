import {
    ContactQuerySchema, JobQuerySchema, NewsQuerySchema, ProjectQuerySchema, UnitQuerySchema,
} from '@repo/shared';
import { GetAllJobsService } from '@/careers/services/get-all-jobs.service';
import { GetAllNewsService } from '@/news/services/get-all-news.service';
import { GetAllProjectsService } from '@/project/services/get-all-projects.service';
import { GetAllUnitsService } from '@/unites/services/get-all-units.service';

// Server-side facet filters (MUK-470): the admin tables send ?isPublished=, ?tag=, ?employmentType=, ?status=.

describe('list query schemas: boolean and multi-value parameters', () => {
    it('parses "false" as false (z.coerce.boolean would have made it true and shown PUBLISHED rows for the Draft filter)', () => {
        for (const schema of [NewsQuerySchema, JobQuerySchema, ProjectQuerySchema, UnitQuerySchema]) {
            expect(schema.parse({ isPublished: 'false' }).isPublished).toBe(false);
            expect(schema.parse({ isPublished: 'true' }).isPublished).toBe(true);
            expect(schema.parse({}).isPublished).toBeUndefined();
        }
    });

    it('rejects a boolean parameter that is neither true nor false', () => {
        expect(NewsQuerySchema.safeParse({ isPublished: 'maybe' }).success).toBe(false);
        expect(ProjectQuerySchema.safeParse({ isFeatured: '1' }).success).toBe(false);
    });

    it('parses comma-separated lists and single values for tag, employmentType and contact status', () => {
        expect(NewsQuerySchema.parse({ tag: 'news,event' }).tag).toEqual(['news', 'event']);
        expect(NewsQuerySchema.parse({ tag: 'event' }).tag).toEqual(['event']);
        expect(JobQuerySchema.parse({ employmentType: 'full_time, contract' }).employmentType).toEqual(['full_time', 'contract']);
        expect(ContactQuerySchema.parse({ status: 'new,closed' }).status).toEqual(['new', 'closed']);
    });

    it('treats an empty list as absent and rejects values outside the enum', () => {
        expect(NewsQuerySchema.parse({ tag: '' }).tag).toBeUndefined();
        expect(NewsQuerySchema.safeParse({ tag: 'news,bogus' }).success).toBe(false);
        expect(ContactQuerySchema.safeParse({ status: 'deleted' }).success).toBe(false);
    });
});

describe('list services apply the facet filters to the page AND the total', () => {
    const make = (model: string) => {
        const prisma = { [model]: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) } };
        return { prisma, where: () => (prisma[model].findMany as jest.Mock).mock.calls[0][0].where, count: prisma[model].count as jest.Mock };
    };

    it('news: tag list and draft filter', async () => {
        const { prisma, where, count } = make('news');
        await new GetAllNewsService(prisma as never).execute({ pageNumber: 1, pageSize: 10, tag: ['news', 'event'], isPublished: false } as never, false);
        expect(where()).toMatchObject({ isDeleted: false, isPublished: false, tag: { in: ['news', 'event'] } });
        expect(count).toHaveBeenCalledWith({ where: where() });
    });

    it('jobs: employment type list', async () => {
        const { prisma, where } = make('job');
        await new GetAllJobsService(prisma as never).execute({ pageNumber: 1, pageSize: 10, employmentType: ['contract'] } as never, false);
        expect(where()).toMatchObject({ employmentType: { in: ['contract'] } });
    });

    it('projects and units: published/draft filter, and the web list is always published-only', async () => {
        const projects = make('project');
        await new GetAllProjectsService(projects.prisma as never).execute({ pageNumber: 1, pageSize: 10, isPublished: false } as never, false);
        expect(projects.where()).toMatchObject({ isPublished: false });

        const units = make('unit');
        await new GetAllUnitsService(units.prisma as never).execute({ pageNumber: 1, pageSize: 10, isPublished: false } as never, false);
        expect(units.where()).toMatchObject({ isPublished: false });

        const web = make('unit');
        await new GetAllUnitsService(web.prisma as never).execute({ pageNumber: 1, pageSize: 10, isPublished: false } as never, true);
        expect(web.where()).toMatchObject({ isPublished: true });
    });

    it('PUBLIC lists stay published-only even when the caller sends isPublished=false (draft leak)', async () => {
        // Parse through the real schemas, exactly as the public routes do, so the whole path is covered.
        const news = make('news');
        await new GetAllNewsService(news.prisma as never).execute(NewsQuerySchema.parse({ isPublished: 'false' }), true);
        expect(news.where()).toMatchObject({ isPublished: true });

        const jobs = make('job');
        await new GetAllJobsService(jobs.prisma as never).execute(JobQuerySchema.parse({ isPublished: 'false' }), true);
        expect(jobs.where()).toMatchObject({ isPublished: true });

        const projects = make('project');
        await new GetAllProjectsService(projects.prisma as never).execute(ProjectQuerySchema.parse({ isPublished: 'false' }), true);
        expect(projects.where()).toMatchObject({ isPublished: true });

        const units = make('unit');
        await new GetAllUnitsService(units.prisma as never).execute(UnitQuerySchema.parse({ isPublished: 'false' }), true);
        expect(units.where()).toMatchObject({ isPublished: true });
    });

    it('does not filter when no facet is given', async () => {
        const { prisma, where } = make('news');
        await new GetAllNewsService(prisma as never).execute({ pageNumber: 1, pageSize: 10 } as never, false);
        expect(where()).toEqual({ isDeleted: false });
    });
});
