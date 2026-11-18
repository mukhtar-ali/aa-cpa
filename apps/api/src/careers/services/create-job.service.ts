import { Injectable } from '@nestjs/common';
import { createUniqueSlug, getLangValue, JobFormModel, LanguageEnum } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { sanitizeRichText } from '@/common/sanitize-html.util';
import { jobMapEntityToModel } from '../helpers/job.mapper';

@Injectable()
export class CreateJobService {
    constructor(private prisma: PrismaService) {}

    async execute(data: JobFormModel) {
        const englishTitle = getLangValue(data.title, LanguageEnum.En);
        const slug = await this.generateUniqueSlug(data.slug || englishTitle);

        const translations = Object.values(LanguageEnum).map((language) => ({
            language: language as any,
            title: getLangValue(data.title, language),
            description: getLangValue(data.description, language),
            body: sanitizeRichText(getLangValue(data.body, language)),
            location: getLangValue(data.location, language),
        }));

        const job = await this.prisma.job.create({
            data: {
                slug,
                employmentType: data.employmentType as any,
                isPublished: data.isPublished ?? false,
                publishedAt: data.isPublished ? new Date() : null,
                translations: { create: translations },
            },
            include: { translations: true },
        });
        return jobMapEntityToModel(job);
    }

    private async generateUniqueSlug(text: string): Promise<string> {
        let slug = createUniqueSlug(text);
        let exists = await this.prisma.job.findUnique({ where: { slug } });
        let counter = 1;
        while (exists) { slug += `_${counter++}`; exists = await this.prisma.job.findUnique({ where: { slug } }); }
        return slug;
    }
}
