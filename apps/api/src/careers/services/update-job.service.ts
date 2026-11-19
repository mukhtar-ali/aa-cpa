import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { getLangValue, JobFormModel, LanguageEnum } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { sanitizeRichText } from '@/common/sanitize-html.util';
import { JobMapper } from '../helpers/job.mapper';

@Injectable()
export class UpdateJobService {
    constructor(private prisma: PrismaService) {}

    async execute(jobId: string, data: JobFormModel) {
        const existing = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { translations: true },
        });
        if (!existing || existing.isDeleted) throw new NotFoundException('Job not found');

        const arTitle = getLangValue(data.title, LanguageEnum.Ar);
        if (!arTitle?.trim()) {
            throw new BadRequestException('Arabic job title is required.');
        }

        // Slug redirect if changed
        if (data.slug && data.slug !== existing.slug) {
            const conflict = await this.prisma.job.findUnique({ where: { slug: data.slug } });
            if (conflict && conflict.id !== jobId && !conflict.isDeleted) {
                throw new BadRequestException(`Slug "${data.slug}" already exists.`);
            }

            if (existing.slug) {
                await this.prisma.slugRedirect.upsert({
                    where: {
                        entityType_fromSlug: {
                            entityType: 'job',
                            fromSlug: existing.slug,
                        },
                    },
                    create: {
                        entityType: 'job',
                        fromSlug: existing.slug,
                        toSlug: data.slug,
                    },
                    update: {
                        toSlug: data.slug,
                    },
                });
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

        const willBePublished = data.isPublished ?? existing.isPublished;
        const job = await this.prisma.job.update({
            where: { id: jobId },
            data: {
                slug: data.slug || existing.slug,
                departmentId: (data as any).departmentId || existing.departmentId,
                officeId: (data as any).officeId !== undefined ? (data as any).officeId : existing.officeId,
                employmentType: data.employmentType as any,
                experienceMin: (data as any).experienceMin !== undefined ? (data as any).experienceMin : existing.experienceMin,
                experienceMax: (data as any).experienceMax !== undefined ? (data as any).experienceMax : existing.experienceMax,
                closesAt: (data as any).closesAt !== undefined ? ((data as any).closesAt ? new Date((data as any).closesAt) : null) : existing.closesAt,
                responsibilities: (data as any).responsibilities !== undefined ? (data as any).responsibilities : existing.responsibilities,
                requirements: (data as any).requirements !== undefined ? (data as any).requirements : existing.requirements,
                benefits: (data as any).benefits !== undefined ? (data as any).benefits : existing.benefits,
                order: (data as any).order !== undefined ? (data as any).order : existing.order,
                isPublished: willBePublished,
                publishedAt: willBePublished && !existing.isPublished ? new Date() : existing.publishedAt,
                translations: {
                    deleteMany: {},
                    create: translations,
                },
            },
            include: {
                translations: true,
                department: true,
                office: true,
            },
        });

        return JobMapper.toAdmin(job);
    }
}
