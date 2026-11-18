import { Prisma } from '@prisma/client';
import { buildMultiLangField, JobApplicationModel, JobModel } from '@repo/shared';
import { withSharedLang } from '@/common/prisma-language.util';

type JobWithTranslations = Prisma.JobGetPayload<{ include: { translations: true } }>;
type JobApplicationWithJob = Prisma.JobApplicationGetPayload<{
    include: { job: { include: { translations: true } } };
}>;

const TRANSLATABLE_FIELDS = ['title', 'description', 'body', 'location'] as const;

export const jobMapEntityToModel = (job: JobWithTranslations): JobModel => {
    const { translations, isDeleted, deletedAt, createdAt, updatedAt, ...rest } = job;
    void isDeleted;
    void deletedAt;

    const sharedTranslations = withSharedLang(translations);
    const translatableFields = Object.fromEntries(
        TRANSLATABLE_FIELDS.map((field) => [field, buildMultiLangField(sharedTranslations, field)]),
    );

    return {
        ...rest,
        ...translatableFields,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
    } as unknown as JobModel;
};

export const jobApplicationMapEntityToModel = (application: JobApplicationWithJob): JobApplicationModel => {
    const { job, createdAt, updatedAt, phone, coverLetter, resumeUrl, notes, ...rest } = application;

    const sharedTranslations = withSharedLang(job.translations);
    const title = buildMultiLangField(sharedTranslations, 'title');

    return {
        ...rest,
        phone: phone ?? undefined,
        coverLetter: coverLetter ?? undefined,
        resumeUrl: resumeUrl ?? undefined,
        notes: notes ?? undefined,
        job: { title, slug: job.slug },
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
    } as unknown as JobApplicationModel;
};
