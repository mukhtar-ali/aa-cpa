import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonialForm } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { ReferenceMapper } from '../reference.mapper';

@Injectable()
export class TestimonialsService {
    constructor(private readonly prisma: PrismaService) {}

    async listWeb(lang: string, placement?: string) {
        const items = await this.prisma.testimonial.findMany({
            where: { isPublished: true, isDeleted: false },
            orderBy: { order: 'asc' },
        });

        let filtered = items;
        if (placement) {
            filtered = items.filter((item: any) => {
                const placements = Array.isArray(item.placement) ? item.placement : [];
                return placements.includes(placement);
            });
        }

        return filtered.map((t) => ReferenceMapper.testimonialToWeb(t, lang));
    }

    async listAdmin() {
        const items = await this.prisma.testimonial.findMany({
            where: { isDeleted: false },
            orderBy: { order: 'asc' },
        });
        return items.map((t) => ReferenceMapper.testimonialToAdmin(t));
    }

    async getByIdAdmin(id: string) {
        const item = await this.prisma.testimonial.findUnique({ where: { id } });
        if (!item || item.isDeleted) throw new NotFoundException(`Testimonial not found: ${id}`);
        return ReferenceMapper.testimonialToAdmin(item);
    }

    async create(data: TestimonialForm) {
        const item = await this.prisma.testimonial.create({
            data: {
                quote: data.quote as any,
                rating: data.rating ?? 5,
                name: data.name as any,
                role: data.role as any,
                company: (data.company as any) || null,
                avatar: data.avatar || null,
                order: data.order ?? 0,
                isPublished: data.isPublished ?? true,
                placement: data.placement || ['home'],
            },
        });
        return ReferenceMapper.testimonialToAdmin(item);
    }

    async update(id: string, data: TestimonialForm) {
        const existing = await this.prisma.testimonial.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`Testimonial not found: ${id}`);

        const item = await this.prisma.testimonial.update({
            where: { id },
            data: {
                quote: data.quote as any,
                rating: data.rating !== undefined ? data.rating : undefined,
                name: data.name as any,
                role: data.role as any,
                company: data.company !== undefined ? (data.company as any) : undefined,
                avatar: data.avatar !== undefined ? data.avatar : undefined,
                order: data.order !== undefined ? data.order : undefined,
                isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
                placement: data.placement !== undefined ? data.placement : undefined,
            },
        });
        return ReferenceMapper.testimonialToAdmin(item);
    }

    async delete(id: string) {
        const existing = await this.prisma.testimonial.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) throw new NotFoundException(`Testimonial not found: ${id}`);

        await this.prisma.testimonial.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        return { message: 'Testimonial deleted successfully' };
    }

    async reorder(items: { id: string; order: number }[]) {
        await this.prisma.$transaction(
            items.map((item) =>
                this.prisma.testimonial.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );
        return { success: true };
    }
}
