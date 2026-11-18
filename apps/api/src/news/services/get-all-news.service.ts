import { Injectable } from '@nestjs/common';
import { NewsQueryModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';
import { newsMapEntityToModel } from '../helpers/news.mapper';

@Injectable()
export class GetAllNewsService {
    constructor(private prisma: PrismaService) {}

    async execute(query: NewsQueryModel, webOnly: boolean) {
        const { pageNumber = 1, pageSize = 10 } = query;
        const where: any = { isDeleted: false };
        if (query.search) {
            where.translations = { some: { title: { contains: query.search } } };
        }
        // The public (web) list is ALWAYS published-only: a caller-supplied isPublished must never override it.
        if (webOnly) where.isPublished = true;
        else if (query.isPublished !== undefined) where.isPublished = query.isPublished;
        if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
        if (query.tag?.length) where.tag = { in: query.tag };

        const [items, total] = await Promise.all([
            this.prisma.news.findMany({
                where, skip: (pageNumber - 1) * pageSize, take: pageSize,
                orderBy: { publishedAt: 'desc' },
                include: { translations: true },
            }),
            this.prisma.news.count({ where }),
        ]);
        return buildPaginationResult(items.map(newsMapEntityToModel), total, pageNumber, pageSize);
    }
}
