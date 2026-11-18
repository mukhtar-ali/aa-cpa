import { Injectable } from '@nestjs/common';
import { UnitQueryModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';
import { unitMapEntityToModel } from '../helpers/unit.mapper';

@Injectable()
export class GetAllUnitsService {
    constructor(private prisma: PrismaService) {}

    async execute(query: UnitQueryModel, webOnly: boolean) {
        const { pageNumber = 1, pageSize = 10 } = query;
        const where: any = { isDeleted: false };
        if (query.search) {
            where.translations = { some: { title: { contains: query.search } } };
        }
        if (query.projectId) where.projectId = query.projectId;
        if (query.bedrooms !== undefined) where.bedrooms = Number(query.bedrooms);
        if (webOnly) {
            where.isPublished = true;
        } else if (query.isPublished !== undefined) {
            where.isPublished = query.isPublished;
        }

        const orderBy =
            query.priceSort === 'asc' || query.priceSort === 'desc'
                ? [{ price: query.priceSort }, { createdAt: 'desc' as const }]
                : [{ createdAt: 'desc' as const }];

        const [items, total] = await Promise.all([
            this.prisma.unit.findMany({
                where,
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
                orderBy,
                include: { translations: true },
            }),
            this.prisma.unit.count({ where }),
        ]);

        return buildPaginationResult(items.map(unitMapEntityToModel), total, pageNumber, pageSize);
    }
}
