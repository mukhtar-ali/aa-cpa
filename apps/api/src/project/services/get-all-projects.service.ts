import { Injectable } from '@nestjs/common';
import { ProjectQueryModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';
import { projectMapEntityToModel } from '../helpers/project.mapper';

@Injectable()
export class GetAllProjectsService {
    constructor(private prisma: PrismaService) {}

    async execute(query: ProjectQueryModel, webOnly: boolean) {
        const { pageNumber = 1, pageSize = 10 } = query;
        const where: any = { isDeleted: false };
        if (query.search) {
            // translations is one row per language — `some` matches a project whose
            // title contains the term in *either* language, not just the active one.
            where.translations = { some: { title: { contains: query.search } } };
        }
        // The public (web) list is ALWAYS published-only: a caller-supplied isPublished must never override it.
        if (webOnly) where.isPublished = true;
        else if (query.isPublished !== undefined) where.isPublished = query.isPublished;
        if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;

        const [items, total] = await Promise.all([
            this.prisma.project.findMany({
                where, skip: (pageNumber - 1) * pageSize, take: pageSize,
                orderBy: { rank: 'asc' },
                include: { translations: true },
            }),
            this.prisma.project.count({ where }),
        ]);
        return buildPaginationResult(items.map(projectMapEntityToModel), total, pageNumber, pageSize);
    }
}
