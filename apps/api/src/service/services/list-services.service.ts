import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ServiceMapper } from '../service.mapper';
import { PaginationQueryModel } from '@repo/shared';

@Injectable()
export class ListServicesService {
    constructor(private readonly prisma: PrismaService) {}

    async listWeb(lang: string) {
        const services = await this.prisma.service.findMany({
            where: {
                isPublished: true,
                isDeleted: false,
                publishedAt: { lte: new Date() },
            },
            include: {
                translations: true,
            },
            orderBy: { order: 'asc' },
        });

        return services.map((s) => ServiceMapper.toSummaryWeb(s, lang));
    }

    async listAdmin(query: any) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = { isDeleted: false };
        if (query?.isPublished !== undefined) {
            where.isPublished = query.isPublished === 'true' || query.isPublished === true;
        }

        if (query?.q) {
            where.OR = [
                { slug: { contains: query.q } },
                { translations: { some: { title: { contains: query.q } } } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.service.findMany({
                where,
                include: {
                    translations: true,
                    sectors: true,
                    faqs: true,
                },
                orderBy: { order: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.service.count({ where }),
        ]);

        return {
            items: items.map((s) => ServiceMapper.toAdmin(s)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
