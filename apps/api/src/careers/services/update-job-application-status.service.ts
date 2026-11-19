import { Injectable, NotFoundException } from '@nestjs/common';
import { JobApplicationStatusModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UpdateJobApplicationStatusService {
    constructor(private prisma: PrismaService) {}

    async execute(id: string, data: JobApplicationStatusModel) {
        const application = await this.prisma.jobApplication.findUnique({ where: { id } });
        if (!application) throw new NotFoundException('Job application not found');
        await this.prisma.jobApplication.update({
            where: { id },
            data: { status: data.status as any, notes: data.notes ?? application.notes },
        });
    }
}
