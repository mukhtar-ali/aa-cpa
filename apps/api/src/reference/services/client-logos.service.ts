import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientLogoForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { ReferenceMapper } from '../reference.mapper';

@Injectable()
export class ClientLogosService {
    constructor(private readonly prisma: PrismaService) {}

    async listWeb(row?: number) {
        const where: any = { isPublished: true, isDeleted: false };
        if (row != null) where.row = row;

        const items = await this.prisma.clientLogo.findMany({
            where,
            orderBy: { order: 'asc' },
        });
        return items.map((l) => ReferenceMapper.clientLogoToWeb(l));
    }

    async listAdmin() {
        const items = await this.prisma.clientLogo.findMany({
            where: { isDeleted: false },
            orderBy: [{ row: 'asc' }, { order: 'asc' }],
        });
        return items.map((l) => ReferenceMapper.clientLogoToAdmin(l));
    }

    async getByIdAdmin(id: string) {
        const item = await this.prisma.clientLogo.findUnique({ where: { id } });
        if (!item || item.isDeleted) throw new NotFoundException(`Client logo not found: ${id}`);
        return ReferenceMapper.clientLogoToAdmin(item);
    }

    async create(data: ClientLogoForm) {
        const item = await this.prisma.clientLogo.create({
            data: {
                name: data.name,
                logo: data.logo || null,
                url: data.url || null,
                row: data.row ?? 1,
                order: data.order ?? 0,
                isPublished: data.isPublished ?? true,
            },
        });
        return ReferenceMapper.clientLogoToAdmin(item);
    }

    async update(id: string, data: ClientLogoForm) {
        const existing = await this.prisma.clientLogo.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`Client logo not found: ${id}`);

        const item = await this.prisma.clientLogo.update({
            where: { id },
            data: {
                name: data.name,
                logo: data.logo !== undefined ? data.logo : undefined,
                url: data.url !== undefined ? (data.url || null) : undefined,
                row: data.row !== undefined ? data.row : undefined,
                order: data.order !== undefined ? data.order : undefined,
                isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
            },
        });
        return ReferenceMapper.clientLogoToAdmin(item);
    }

    async delete(id: string) {
        const existing = await this.prisma.clientLogo.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`Client logo not found: ${id}`);

        await this.prisma.clientLogo.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        return { message: 'Client logo deleted successfully' };
    }

    async reorder(items: { id: string; order: number }[]) {
        await this.prisma.$transaction(
            items.map((item) =>
                this.prisma.clientLogo.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );
        return { success: true };
    }
}
