import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeleteJobApplicationService {
    constructor(private prisma: PrismaService) {}

    async execute(id: string) {
        const application = await this.prisma.jobApplication.findUnique({ where: { id } });
        if (!application) throw new NotFoundException('Job application not found');
        await this.prisma.jobApplication.delete({ where: { id } });
    }
}
