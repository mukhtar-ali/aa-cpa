import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { jobMapEntityToModel } from '../helpers/job.mapper';

@Injectable()
export class GetJobByIdService {
    constructor(private prisma: PrismaService) {}

    async execute(jobId: string) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId }, include: { translations: true } });
        if (!job || job.isDeleted) throw new NotFoundException('Job not found');
        return jobMapEntityToModel(job);
    }
}
