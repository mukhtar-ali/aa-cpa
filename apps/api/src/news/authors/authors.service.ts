import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthorForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthorsService {
    constructor(private readonly prisma: PrismaService) {}

    async list(query?: any) {
        return this.prisma.author.findMany({
            where: { isDeleted: false },
            orderBy: { order: 'asc' },
        });
    }

    async getById(id: string) {
        const author = await this.prisma.author.findUnique({
            where: { id },
        });
        if (!author || author.isDeleted) {
            throw new NotFoundException(`Author not found: ${id}`);
        }
        return author;
    }

    async create(data: AuthorForm) {
        if (!data.name || typeof data.name !== 'object') {
            throw new BadRequestException('Author name must be a multi-language object.');
        }

        return this.prisma.author.create({
            data: {
                name: data.name as any,
                role: (data.role || {}) as any,
                bio: (data.bio || {}) as any,
                avatar: data.avatar || undefined,
                order: data.order ?? 0,
            },
        });
    }

    async update(id: string, data: AuthorForm) {
        const existing = await this.prisma.author.findUnique({
            where: { id },
        });
        if (!existing || existing.isDeleted) {
            throw new NotFoundException(`Author not found: ${id}`);
        }

        return this.prisma.author.update({
            where: { id },
            data: {
                name: data.name as any,
                role: (data.role || {}) as any,
                bio: (data.bio || {}) as any,
                avatar: data.avatar !== undefined ? data.avatar : undefined,
                order: data.order ?? 0,
            },
        });
    }

    async delete(id: string) {
        const existing = await this.prisma.author.findUnique({
            where: { id },
        });
        if (!existing || existing.isDeleted) {
            throw new NotFoundException(`Author not found: ${id}`);
        }

        return this.prisma.author.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}
