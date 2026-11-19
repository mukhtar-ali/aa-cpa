import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ArticleCategoryForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ArticleCategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    async list(query?: any) {
        return this.prisma.articleCategory.findMany({
            where: { isDeleted: false },
            orderBy: { order: 'asc' },
        });
    }

    async getById(id: string) {
        const cat = await this.prisma.articleCategory.findUnique({
            where: { id },
        });
        if (!cat || cat.isDeleted) {
            throw new NotFoundException(`Article category not found: ${id}`);
        }
        return cat;
    }

    async create(data: ArticleCategoryForm) {
        if (!data.name || typeof data.name !== 'object') {
            throw new BadRequestException('Category name must be a multi-language object.');
        }

        const existing = await this.prisma.articleCategory.findUnique({
            where: { slug: data.slug },
        });
        if (existing && !existing.isDeleted) {
            throw new BadRequestException(`Category slug "${data.slug}" already exists.`);
        }

        return this.prisma.articleCategory.create({
            data: {
                slug: data.slug,
                name: data.name as any,
                order: data.order ?? 0,
                isCaseStory: data.isCaseStory ?? false,
            },
        });
    }

    async update(id: string, data: ArticleCategoryForm) {
        const existing = await this.prisma.articleCategory.findUnique({
            where: { id },
        });
        if (!existing || existing.isDeleted) {
            throw new NotFoundException(`Article category not found: ${id}`);
        }

        if (data.slug && data.slug !== existing.slug) {
            const conflict = await this.prisma.articleCategory.findUnique({
                where: { slug: data.slug },
            });
            if (conflict && conflict.id !== id && !conflict.isDeleted) {
                throw new BadRequestException(`Category slug "${data.slug}" already exists.`);
            }
        }

        return this.prisma.articleCategory.update({
            where: { id },
            data: {
                slug: data.slug,
                name: data.name as any,
                order: data.order ?? 0,
                isCaseStory: data.isCaseStory ?? false,
            },
        });
    }

    async delete(id: string) {
        const existing = await this.prisma.articleCategory.findUnique({
            where: { id },
        });
        if (!existing || existing.isDeleted) {
            throw new NotFoundException(`Article category not found: ${id}`);
        }

        const articlesCount = await this.prisma.news.count({
            where: { categoryId: id, isDeleted: false },
        });

        if (articlesCount > 0) {
            throw new ConflictException(`Cannot delete category because it is referenced by ${articlesCount} article(s).`);
        }

        return this.prisma.articleCategory.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}
