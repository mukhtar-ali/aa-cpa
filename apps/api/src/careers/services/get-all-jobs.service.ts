import { Injectable } from '@nestjs/common';
import { JobQueryModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';
import { jobMapEntityToModel } from '../helpers/job.mapper';

@Injectable()
export class GetAllJobsService {
    constructor(private prisma: PrismaService) {}

    async execute(query: JobQueryModel, webOnly: boolean) {
        const { pageNumber = 1, pageSize = 10 } = query;
        const where: any = { isDeleted: false };
        if (query.search) {
            where.translations = { some: { title: { contains: query.search } } };
        }
        // The public (web) list is ALWAYS published-only: a caller-supplied isPublished must never override it.
        if (webOnly) where.isPublished = true;
        else if (query.isPublished !== undefined) where.isPublished = query.isPublished;
        if (query.employmentType?.length) where.employmentType = { in: query.employmentType };

        const [items, total] = await Promise.all([
            this.prisma.job.findMany({
                where, skip: (pageNumber - 1) * pageSize, take: pageSize,
                orderBy: { publishedAt: 'desc' },
                include: { translations: true },
            }),
            this.prisma.job.count({ where }),
        ]);
        return buildPaginationResult(items.map(jobMapEntityToModel), total, pageNumber, pageSize);
    }
}
