import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ResourceService } from '@/resource/resource.service';
import { jobApplicationMapEntityToModel } from '../helpers/job.mapper';

@Injectable()
export class GetJobApplicationByIdService {
    constructor(
        private prisma: PrismaService,
        private readonly resources: ResourceService,
    ) {}

    async execute(id: string) {
        const application = await this.prisma.jobApplication.findUnique({
            where: { id },
            include: { job: { include: { translations: true } } },
        });
        if (!application) throw new NotFoundException('Job application not found');
        const model = jobApplicationMapEntityToModel(application);
        const resumeUrl = application.resumeKey
            ? await this.resources.signedReadUrlOrOriginal(application.resumeKey)
            : undefined;
        return { ...model, resumeUrl };
    }
}
