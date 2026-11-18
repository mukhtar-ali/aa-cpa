import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactFormModel, ContactQueryModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';

@Injectable()
export class ContactService {
    constructor(private prisma: PrismaService) {}

    async create(data: ContactFormModel) {
        return this.prisma.contact.create({ data: { ...data } });
    }

    async findAll(query: ContactQueryModel) {
        const { pageNumber = 1, pageSize = 10 } = query;
        const where: Record<string, unknown> = { isDeleted: false };
        if (query.status?.length) where.status = { in: query.status };
        const search = query.search?.trim();
        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { subject: { contains: search } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.contact.findMany({
                where,
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.contact.count({ where }),
        ]);
        return buildPaginationResult(items, total, pageNumber, pageSize);
    }

    async countUnread() {
        return this.prisma.contact.count({ where: { status: 'new', isDeleted: false } });
    }

    async findById(id: string) {
        const contact = await this.prisma.contact.findUnique({ where: { id } });
        if (!contact || contact.isDeleted) throw new NotFoundException('Contact submission not found');
        return contact;
    }

    async updateStatus(id: string, status: string) {
        await this.findById(id);
        return this.prisma.contact.update({ where: { id }, data: { status } });
    }

    async delete(id: string) {
        await this.findById(id);
        await this.prisma.contact.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
    }
}
