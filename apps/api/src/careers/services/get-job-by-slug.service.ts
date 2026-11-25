import { Injectable, NotFoundException } from '@nestjs/common';
import { publishedNow } from '@/common/visibility';
import { PrismaService } from '@/prisma/prisma.service';
import { JobMapper } from '../helpers/job.mapper';

@Injectable()
export class GetJobBySlugService {
    constructor(private prisma: PrismaService) {}

    async execute(slug: string, webOnly: boolean, lang: string = 'ar', previewToken?: string) {
        const where: any = { slug, isDeleted: false };
        if (webOnly) Object.assign(where, publishedNow());

        const job = await this.prisma.job.findFirst({
            where,
            include: {
                translations: true,
                department: true,
                office: true,
            },
        });

        if (!job) {
            const redirect = await this.prisma.redirect.findFirst({
                where: {
                    fromPath: `/careers/${slug}`,
                },
            });

            if (redirect) {
                const targetSlug = redirect.toPath.replace(/^\/careers\//, '');
                return { redirectTo: targetSlug };
            }

            throw new NotFoundException(`Job not found: ${slug}`);
        }

        if (!webOnly) {
            return JobMapper.toAdmin(job);
        }

        // Fetch similar open jobs in same department
        const similarJobs = await this.prisma.job.findMany({
            where: {
                id: { not: job.id },
                departmentId: job.departmentId,
                ...publishedNow(),
                OR: [
                    { closesAt: null },
                    { closesAt: { gt: new Date() } },
                ],
            },
            take: 3,
            orderBy: { order: 'asc' },
            include: {
                translations: true,
                department: true,
                office: true,
            },
        });

        return JobMapper.toDetailWeb(job, lang, similarJobs);
    }
}
