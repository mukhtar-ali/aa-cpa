import { Injectable, NotFoundException } from '@nestjs/common';
import { OfficeForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { ReferenceMapper } from '../reference.mapper';

@Injectable()
export class OfficesService {
    constructor(private readonly prisma: PrismaService) {}

    async listWeb(lang: string) {
        const items = await this.prisma.office.findMany({
            where: { isPublished: true, isDeleted: false },
            orderBy: { order: 'asc' },
        });
        return items.map((o) => ReferenceMapper.officeToWeb(o, lang));
    }

    async listAdmin() {
        const items = await this.prisma.office.findMany({
            where: { isDeleted: false },
            orderBy: { order: 'asc' },
        });
        return items.map((o) => ReferenceMapper.officeToAdmin(o));
    }

    async getByIdAdmin(id: string) {
        const office = await this.prisma.office.findUnique({
            where: { id },
        });
        if (!office || office.isDeleted) throw new NotFoundException(`Office not found: ${id}`);
        return ReferenceMapper.officeToAdmin(office);
    }

    async create(data: OfficeForm) {
        const office = await this.prisma.office.create({
            data: {
                city: data.city as any,
                address: data.address as any,
                mapUrl: data.mapUrl || null,
                mapX: data.mapX ?? null,
                mapY: data.mapY ?? null,
                image: data.image || null,
                isHeadquarters: data.isHeadquarters ?? false,
                order: data.order ?? 0,
                isPublished: data.isPublished ?? true,
            },
        });
        return ReferenceMapper.officeToAdmin(office);
    }

    async update(id: string, data: OfficeForm) {
        const existing = await this.prisma.office.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`Office not found: ${id}`);

        const office = await this.prisma.office.update({
            where: { id },
            data: {
                city: data.city as any,
                address: data.address as any,
                mapUrl: data.mapUrl !== undefined ? (data.mapUrl || null) : undefined,
                mapX: data.mapX !== undefined ? data.mapX : undefined,
                mapY: data.mapY !== undefined ? data.mapY : undefined,
                image: data.image !== undefined ? (data.image || null) : undefined,
                isHeadquarters: data.isHeadquarters !== undefined ? data.isHeadquarters : undefined,
                order: data.order !== undefined ? data.order : undefined,
                isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
            },
        });
        return ReferenceMapper.officeToAdmin(office);
    }

    async delete(id: string) {
        const existing = await this.prisma.office.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`Office not found: ${id}`);

        await this.prisma.office.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        return { message: 'Office deleted successfully' };
    }

    async reorder(items: { id: string; order: number }[]) {
        await this.prisma.$transaction(
            items.map((item) =>
                this.prisma.office.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );
        return { success: true };
    }
}
