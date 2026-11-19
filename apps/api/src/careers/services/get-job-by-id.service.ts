import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { JobMapper } from '../helpers/job.mapper';

@Injectable()
export class GetJobByIdService {
    constructor(private prisma: PrismaService) {}

    async execute(jobId: string) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                translations: true,
                department: true,
                office: true,
            },
        });
        if (!job || job.isDeleted) throw new NotFoundException('Job not found');
        return JobMapper.toAdmin(job);
    }
}
