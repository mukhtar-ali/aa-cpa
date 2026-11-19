import { Injectable, NotFoundException } from '@nestjs/common';
import { CredentialForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { ReferenceMapper } from '../reference.mapper';

@Injectable()
export class CredentialsService {
    constructor(private readonly prisma: PrismaService) {}

    async listWeb(lang: string) {
        const items = await this.prisma.credential.findMany({
            where: { isPublished: true, isDeleted: false },
            orderBy: { order: 'asc' },
        });
        return items.map((c) => ReferenceMapper.credentialToWeb(c, lang));
    }

    async listAdmin() {
        const items = await this.prisma.credential.findMany({
            where: { isDeleted: false },
            orderBy: { order: 'asc' },
        });
        return items.map((c) => ReferenceMapper.credentialToAdmin(c));
    }

    async getByIdAdmin(id: string) {
        const item = await this.prisma.credential.findUnique({ where: { id } });
        if (!item || item.isDeleted) throw new NotFoundException(`Credential not found: ${id}`);
        return ReferenceMapper.credentialToAdmin(item);
    }

    async create(data: CredentialForm) {
        const item = await this.prisma.credential.create({
            data: {
                name: data.name as any,
                logo: data.logo || null,
                url: data.url || null,
                order: data.order ?? 0,
                isPublished: data.isPublished ?? true,
            },
        });
        return ReferenceMapper.credentialToAdmin(item);
    }

    async update(id: string, data: CredentialForm) {
        const existing = await this.prisma.credential.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`Credential not found: ${id}`);

        const item = await this.prisma.credential.update({
            where: { id },
            data: {
                name: data.name as any,
                logo: data.logo !== undefined ? data.logo : undefined,
                url: data.url !== undefined ? (data.url || null) : undefined,
                order: data.order !== undefined ? data.order : undefined,
                isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
            },
        });
        return ReferenceMapper.credentialToAdmin(item);
    }

    async delete(id: string) {
        const existing = await this.prisma.credential.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`Credential not found: ${id}`);

        await this.prisma.credential.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        return { message: 'Credential deleted successfully' };
    }

    async reorder(items: { id: string; order: number }[]) {
        await this.prisma.$transaction(
            items.map((item) =>
                this.prisma.credential.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );
        return { success: true };
    }
}
