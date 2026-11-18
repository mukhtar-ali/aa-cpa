import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { projectMapEntityToModel } from '../helpers/project.mapper';

@Injectable()
export class GetProjectBySlugService {
    constructor(private prisma: PrismaService) {}

    async execute(slug: string, webOnly: boolean) {
        const where: any = { slug, isDeleted: false };
        if (webOnly) where.isPublished = true;
        const project = await this.prisma.project.findFirst({
            where, include: { translations: true, units: { include: { translations: true } } },
        });
        if (!project) throw new NotFoundException('Project not found');
        return projectMapEntityToModel(project);
    }
}
