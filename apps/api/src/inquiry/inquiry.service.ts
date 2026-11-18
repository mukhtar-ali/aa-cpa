import { Injectable, NotFoundException } from '@nestjs/common';
import { InquiryFormModel, InquiryQueryModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';

@Injectable()
export class InquiryService {
    constructor(private prisma: PrismaService) {}

    async create(data: InquiryFormModel) {
        return this.prisma.inquiry.create({ data: { ...data } as any });
    }

    async findAll(query: InquiryQueryModel) {
        const { pageNumber = 1, pageSize = 10 } = query;
        const where: any = { isDeleted: false };
        if (query.projectId) where.projectId = query.projectId;
        const search = query.search?.trim();
        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.inquiry.findMany({ where, skip: (pageNumber - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }),
            this.prisma.inquiry.count({ where }),
        ]);
        return buildPaginationResult(items, total, pageNumber, pageSize);
    }

    async findById(id: string) {
        const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
        if (!inquiry) throw new NotFoundException('Inquiry not found');
        return inquiry;
    }

    async delete(id: string) {
        await this.findById(id);
        await this.prisma.inquiry.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
    }
}
