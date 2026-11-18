import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { jobMapEntityToModel } from '../helpers/job.mapper';

@Injectable()
export class GetJobBySlugService {
    constructor(private prisma: PrismaService) {}

    async execute(slug: string, webOnly: boolean) {
        const where: any = { slug, isDeleted: false };
        if (webOnly) where.isPublished = true;
        const job = await this.prisma.job.findFirst({ where, include: { translations: true } });
        if (!job) throw new NotFoundException('Job not found');
        return jobMapEntityToModel(job);
    }
}
