import { Injectable, NotFoundException } from '@nestjs/common';
import { FaqItemForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { ReferenceMapper } from '../reference.mapper';

@Injectable()
export class FaqsService {
    constructor(private readonly prisma: PrismaService) {}

    async listWeb(lang: string, scope?: string, serviceId?: string) {
        const where: any = { isPublished: true, isDeleted: false };
        if (scope) where.scope = scope;
        if (serviceId) where.serviceId = serviceId;

        const items = await this.prisma.faqItem.findMany({
            where,
            orderBy: { order: 'asc' },
        });
        return items.map((f) => ReferenceMapper.faqToWeb(f, lang));
    }

    async listAdmin(scope?: string, serviceId?: string) {
        const where: any = { isDeleted: false };
        if (scope) where.scope = scope;
        if (serviceId) where.serviceId = serviceId;

        const items = await this.prisma.faqItem.findMany({
            where,
            orderBy: { order: 'asc' },
            include: {
                service: {
                    include: { translations: true },
                },
            },
        });
        return items.map((f) => ReferenceMapper.faqToAdmin(f));
    }

    async getByIdAdmin(id: string) {
        const item = await this.prisma.faqItem.findUnique({
            where: { id },
            include: {
                service: {
                    include: { translations: true },
                },
            },
        });
        if (!item || item.isDeleted) throw new NotFoundException(`FAQ item not found: ${id}`);
        return ReferenceMapper.faqToAdmin(item);
    }

    async create(data: FaqItemForm) {
        const item = await this.prisma.faqItem.create({
            data: {
                question: data.question as any,
                answer: data.answer as any,
                scope: (data.scope as any) || 'global',
                serviceId: data.serviceId || null,
                order: data.order ?? 0,
                isPublished: data.isPublished ?? true,
            },
        });
        return ReferenceMapper.faqToAdmin(item);
    }

    async update(id: string, data: FaqItemForm) {
        const existing = await this.prisma.faqItem.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`FAQ item not found: ${id}`);

        const item = await this.prisma.faqItem.update({
            where: { id },
            data: {
                question: data.question as any,
                answer: data.answer as any,
                scope: data.scope !== undefined ? (data.scope as any) : undefined,
                serviceId: data.serviceId !== undefined ? (data.serviceId || null) : undefined,
                order: data.order !== undefined ? data.order : undefined,
                isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
            },
        });
        return ReferenceMapper.faqToAdmin(item);
    }

    async delete(id: string) {
        const existing = await this.prisma.faqItem.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`FAQ item not found: ${id}`);

        await this.prisma.faqItem.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        return { message: 'FAQ item deleted successfully' };
    }

    async reorder(items: { id: string; order: number }[]) {
        await this.prisma.$transaction(
            items.map((item) =>
                this.prisma.faqItem.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );
        return { success: true };
    }
}
