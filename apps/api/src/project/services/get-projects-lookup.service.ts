import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class GetProjectsLookupService {
    constructor(private prisma: PrismaService) {}

    async execute() {
        const projects = await this.prisma.project.findMany({
            where: { isDeleted: false, isPublished: true },
            select: { id: true, slug: true, translations: { select: { language: true, title: true } } },
            orderBy: { rank: 'asc' },
        });
        return projects.map((p) => ({
            value: p.id,
            slug: p.slug,
            label: p.translations.reduce((acc, t) => ({ ...acc, [t.language]: t.title }), { en: '', ar: '' }),
        }));
    }
}
