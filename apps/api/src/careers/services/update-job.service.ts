import { Injectable, NotFoundException } from '@nestjs/common';
import { getLangValue, JobFormModel, LanguageEnum } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { sanitizeRichText } from '@/common/sanitize-html.util';
import { jobMapEntityToModel } from '../helpers/job.mapper';

@Injectable()
export class UpdateJobService {
    constructor(private prisma: PrismaService) {}

    async execute(jobId: string, data: JobFormModel) {
        const existing = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!existing || existing.isDeleted) throw new NotFoundException('Job not found');

        const translations = Object.values(LanguageEnum).map((language) => ({
            language: language as any,
            title: getLangValue(data.title, language),
            description: getLangValue(data.description, language),
            body: sanitizeRichText(getLangValue(data.body, language)),
            location: getLangValue(data.location, language),
        }));

        const willBePublished = data.isPublished ?? existing.isPublished;
        const job = await this.prisma.job.update({
            where: { id: jobId },
            data: {
                employmentType: data.employmentType as any,
                isPublished: willBePublished,
                publishedAt: willBePublished && !existing.isPublished ? new Date() : existing.publishedAt,
                translations: {
                    deleteMany: {},
                    create: translations,
                },
            },
            include: { translations: true },
        });
        return jobMapEntityToModel(job);
    }
}
