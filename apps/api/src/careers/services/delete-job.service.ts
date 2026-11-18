import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeleteJobService {
    constructor(private prisma: PrismaService) {}

    async execute(jobId: string) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.isDeleted) throw new NotFoundException('Job not found');
        await this.prisma.job.update({ where: { id: jobId }, data: { isDeleted: true, deletedAt: new Date() } });
    }
}
