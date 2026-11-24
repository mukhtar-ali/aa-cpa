import { BadRequestException, Injectable } from '@nestjs/common';
import { createUniqueSlug, getLangValue, JobFormModel, LanguageEnum } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { sanitizeRichText } from '@/common/sanitize-html.util';
import { JobMapper } from '../helpers/job.mapper';

@Injectable()
export class CreateJobService {
    constructor(private prisma: PrismaService) {}

    async execute(data: JobFormModel) {
        const arTitle = getLangValue(data.title, LanguageEnum.Ar);
        if (!arTitle?.trim()) {
            throw new BadRequestException('Arabic job title is required.');
        }

        const englishTitle = getLangValue(data.title, LanguageEnum.En);
        const slug = await this.generateUniqueSlug(data.slug || englishTitle || arTitle);

        // Ensure department
        let departmentId = (data as any).departmentId;
        if (!departmentId) {
            const firstDept = await this.prisma.jobDepartment.findFirst({
                where: { isDeleted: false },
                orderBy: { order: 'asc' },
            });
            if (firstDept) {
                departmentId = firstDept.id;
            } else {
                const defaultDept = await this.prisma.jobDepartment.create({
                    data: {
                        slug: 'general',
                        name: { ar: 'عام', en: 'General' },
                        order: 0,
                    },
                });
                departmentId = defaultDept.id;
            }
        }

        const translations = Object.values(LanguageEnum).map((language) => ({
            language: language as any,
            title: getLangValue(data.title, language),
            summary: getLangValue((data as any).summary || (data as any).description, language) || '',
            body: sanitizeRichText(getLangValue(data.body, language) || ''),
            location: getLangValue(data.location, language) || null,
            metaTitle: getLangValue(data.metaTitle, language) || null,
            metaDescription: getLangValue(data.metaDescription, language) || null,
            keywords: getLangValue(data.keywords, language) || null,
        }));

        const isPublished = data.isPublished ?? false;

        const job = await this.prisma.job.create({
            data: {
                slug,
                departmentId,
                officeId: (data as any).officeId || null,
                employmentType: data.employmentType as any,
                experienceMin: (data as any).experienceMin || null,
                experienceMax: (data as any).experienceMax || null,
                closesAt: (data as any).closesAt ? new Date((data as any).closesAt) : null,
                responsibilities: (data as any).responsibilities || [],
                requirements: (data as any).requirements || [],
                benefits: (data as any).benefits || [],
                order: (data as any).order ?? 0,
                isPublished,
                publishedAt: isPublished ? ((data as any).publishedAt ? new Date((data as any).publishedAt) : new Date()) : null,
                ogImage: (data.ogImage as any) || null,
                noindex: data.noindex ?? false,
                translations: { create: translations },
            } as any,
            include: {
                translations: true,
                department: true,
                office: true,
            },
        });

        return JobMapper.toAdmin(job);
    }

    private async generateUniqueSlug(text: string): Promise<string> {
        let slug = createUniqueSlug(text);
        let exists = await this.prisma.job.findUnique({ where: { slug } });
        let counter = 1;
        while (exists) {
            slug = `${slug}_${counter++}`;
            exists = await this.prisma.job.findUnique({ where: { slug } });
        }
        return slug;
    }
}
