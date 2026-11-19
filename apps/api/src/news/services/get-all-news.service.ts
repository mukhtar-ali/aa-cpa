import { Injectable } from '@nestjs/common';
import { NewsQueryModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';
import { NewsMapper } from '../helpers/news.mapper';

@Injectable()
export class GetAllNewsService {
    constructor(private prisma: PrismaService) {}

    async execute(query: NewsQueryModel, webOnly: boolean, lang: string = 'ar') {
        const pageNumber = Number(query.pageNumber || (query as any).page) || 1;
        const pageSize = Number(query.pageSize || (query as any).limit) || 10;
        const where: any = { isDeleted: false };

        const search = query.search || query.q;
        if (search) {
            where.translations = { some: { title: { contains: search } } };
        }

        // The public (web) list is ALWAYS published-only
        if (webOnly) {
            where.isPublished = true;
        } else if (query.isPublished !== undefined) {
            where.isPublished = query.isPublished === true || query.isPublished === 'true';
        }

        if (query.isFeatured !== undefined) {
            where.isFeatured = query.isFeatured === true || query.isFeatured === 'true';
        }

        if (query.categoryId) {
            where.categoryId = query.categoryId;
        }

        if (query.sectorId) {
            where.sectors = { some: { sectorId: query.sectorId } };
        } else if (query.sector) {
            where.sectors = { some: { sector: { slug: query.sector } } };
        }

        if (query.serviceId) {
            where.services = { some: { serviceId: query.serviceId } };
        } else if (query.service) {
            where.services = { some: { service: { slug: query.service } } };
        }

        const [items, total] = await Promise.all([
            this.prisma.news.findMany({
                where,
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
                orderBy: { publishedAt: 'desc' },
                include: {
                    translations: true,
                    category: true,
                    author: true,
                    sectors: { include: { sector: { include: { translations: true } } } },
                    services: { include: { service: { include: { translations: true } } } },
                },
            }),
            this.prisma.news.count({ where }),
        ]);

        const mapped = webOnly
            ? items.map((item) => NewsMapper.toSummaryWeb(item, lang))
            : items.map((item) => NewsMapper.toAdmin(item));

        return buildPaginationResult(mapped, total, pageNumber, pageSize);
    }
}
