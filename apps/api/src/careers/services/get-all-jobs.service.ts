import { Injectable } from '@nestjs/common';
import { JobQueryModel } from '@repo/shared';
import { publishedNow } from '@/common/visibility';
import { PrismaService } from '@/prisma/prisma.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';
import { JobMapper } from '../helpers/job.mapper';

@Injectable()
export class GetAllJobsService {
    constructor(private prisma: PrismaService) {}

    async execute(query: JobQueryModel, webOnly: boolean, lang: string = 'ar') {
        const pageNumber = Number(query.pageNumber || (query as any).page) || 1;
        const pageSize = Number(query.pageSize || (query as any).limit) || 10;
        const where: any = { isDeleted: false };

        const search = query.search || query.q;
        if (search) {
            where.translations = { some: { title: { contains: search } } };
        }

        // The public (web) list is ALWAYS published-only and open-only (closesAt > now or null)
        if (webOnly) {
            Object.assign(where, publishedNow());
            where.OR = [
                { closesAt: null },
                { closesAt: { gt: new Date() } },
            ];
        } else if (query.isPublished !== undefined) {
            where.isPublished = (query.isPublished as any) === true || (query.isPublished as any) === 'true';
        }

        if (query.departmentId) {
            where.departmentId = query.departmentId;
        } else if (query.department) {
            where.department = { slug: query.department };
        }

        if (query.officeId) {
            where.officeId = query.officeId;
        }

        if (query.employmentType?.length) {
            where.employmentType = Array.isArray(query.employmentType)
                ? { in: query.employmentType }
                : query.employmentType;
        }

        const [items, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
                orderBy: { order: 'asc' },
                include: {
                    translations: true,
                    department: true,
                    office: true,
                },
            }),
            this.prisma.job.count({ where }),
        ]);

        const mapped = webOnly
            ? items.map((item) => JobMapper.toSummaryWeb(item, lang))
            : items.map((item) => JobMapper.toAdmin(item));

        return buildPaginationResult(mapped as any, total, pageNumber, pageSize);
    }
}
