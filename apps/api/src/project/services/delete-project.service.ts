import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeleteProjectService {
    constructor(private prisma: PrismaService) {}

    async execute(projectId: string) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project || project.isDeleted) throw new NotFoundException('Project not found');
        await this.prisma.project.update({
            where: { id: projectId },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
}
