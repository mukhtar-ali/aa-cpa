import { Injectable } from '@nestjs/common';
import { JobApplicationQueryModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { ResourceService } from '@/resource/resource.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';
import { jobApplicationMapEntityToModel } from '../helpers/job.mapper';

@Injectable()
export class GetAllJobApplicationsService {
    constructor(
        private prisma: PrismaService,
        private readonly resources: ResourceService,
    ) {}

    async execute(query: JobApplicationQueryModel, jobId?: string) {
        const { pageNumber = 1, pageSize = 10 } = query;
        const where: any = {};
        if (jobId ?? query.jobId) where.jobId = jobId ?? query.jobId;
        if (query.status) where.status = query.status;

        const [items, total] = await Promise.all([
            this.prisma.jobApplication.findMany({
                where, skip: (pageNumber - 1) * pageSize, take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: { job: { include: { translations: true } } },
            }),
            this.prisma.jobApplication.count({ where }),
        ]);
        // Résumés are private objects: the admin gets short-lived signed links instead of the stored URL.
        const models = await Promise.all(
            items.map(async (item) => {
                const model = jobApplicationMapEntityToModel(item);
                return model.resumeUrl ? { ...model, resumeUrl: await this.resources.signedReadUrlOrOriginal(model.resumeUrl) } : model;
            }),
        );
        return buildPaginationResult(models, total, pageNumber, pageSize);
    }
}
