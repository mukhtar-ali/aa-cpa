import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { projectMapEntityToModel } from '../helpers/project.mapper';

@Injectable()
export class GetProjectByIdService {
    constructor(private prisma: PrismaService) {}

    async execute(projectId: string) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { translations: true, units: { include: { translations: true } } },
        });
        if (!project || project.isDeleted) throw new NotFoundException('Project not found');
        return projectMapEntityToModel(project);
    }
}
