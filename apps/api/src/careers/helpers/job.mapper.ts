import { Prisma } from '@prisma/client';
import {
    buildMultiLangField,
    JobAdmin,
    JobApplicationModel,
    JobDetailWeb,
    JobModel,
    JobSummaryWeb,
} from '@repo/shared';
import { withSharedLang } from '@/common/prisma-language.util';

function resolveField(val: any, lang: string): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val.ar || val.en || '';
}

const EMPLOYMENT_TYPE_LABELS: Record<string, { ar: string; en: string }> = {
    full_time: { ar: 'دوام كامل', en: 'Full Time' },
    part_time: { ar: 'دوام جزئي', en: 'Part Time' },
    contract: { ar: 'عقد', en: 'Contract' },
    internship: { ar: 'تدريب', en: 'Internship' },
    cooperative_training: { ar: 'تدريب تعاوني', en: 'Co-op Training' },
};

function formatExperience(min?: number | null, max?: number | null, lang: string = 'ar'): string {
    if (min != null && max != null) {
        return lang === 'ar' ? `${min}-${max} سنوات` : `${min}-${max} Years`;
    }
    if (min != null) {
        return lang === 'ar' ? `من ${min} سنوات` : `${min}+ Years`;
    }
    if (max != null) {
        return lang === 'ar' ? `حتى ${max} سنوات` : `Up to ${max} Years`;
    }
    return lang === 'ar' ? 'غير محدد' : 'Not specified';
}

export class JobMapper {
    static toSummaryWeb(job: any, lang: string): JobSummaryWeb & { isFallback?: boolean } {
        const arTr = job.translations?.find((t: any) => t.language === 'ar');
        const langTr = job.translations?.find((t: any) => t.language === lang);
        const tr = langTr || arTr || job.translations?.[0] || {};
        const isFallback = lang !== 'ar' && !langTr && !!arTr;

        const departmentName = job.department
            ? resolveField(job.department.name, lang) || job.department.slug
            : '';

        const cityName = job.office
            ? resolveField(job.office.city, lang)
            : tr.location || '';

        const contractType = EMPLOYMENT_TYPE_LABELS[job.employmentType]
            ? (lang === 'ar' ? EMPLOYMENT_TYPE_LABELS[job.employmentType].ar : EMPLOYMENT_TYPE_LABELS[job.employmentType].en)
            : job.employmentType;

        const experience = formatExperience(job.experienceMin, job.experienceMax, lang);

        const closesAtStr = job.closesAt ? new Date(job.closesAt).toISOString().split('T')[0] : undefined;

        return {
            id: job.id,
            slug: job.slug,
            title: tr.title || '',
            department: departmentName,
            city: cityName,
            contract: contractType,
            experience,
            summary: tr.summary || undefined,
            closesAt: closesAtStr,
            href: `/${lang}/careers/${job.slug}`,
            isFallback,
        };
    }

    static toDetailWeb(job: any, lang: string, similarJobs?: any[]): JobDetailWeb {
        const summary = this.toSummaryWeb(job, lang);
        const arTr = job.translations?.find((t: any) => t.language === 'ar');
        const langTr = job.translations?.find((t: any) => t.language === lang);
        const tr = langTr || arTr || job.translations?.[0] || {};

        const isOpen = job.isPublished && (!job.closesAt || new Date(job.closesAt) > new Date());

        const parseList = (list: any): string[] => {
            if (!Array.isArray(list)) return [];
            return list.map((item) => resolveField(item, lang)).filter(Boolean);
        };

        const parseBenefits = (benefits: any): Array<{ title: string; body: string }> => {
            if (!Array.isArray(benefits)) return [];
            return benefits.map((b) => ({
                title: resolveField(b.title, lang),
                body: resolveField(b.body, lang),
            }));
        };

        const similar = (similarJobs || []).map((j) => this.toSummaryWeb(j, lang));

        return {
            ...summary,
            body: tr.body || '',
            responsibilities: parseList(job.responsibilities),
            requirements: parseList(job.requirements),
            benefits: parseBenefits(job.benefits),
            similarJobs: similar,
            isOpen,
            seo: {
                metaTitle: tr.metaTitle || undefined,
                metaDescription: tr.metaDescription || undefined,
                keywords: tr.keywords || undefined,
                ogImage: (job.ogImage?.url || job.ogImage) || undefined,
                noindex: job.noindex ?? false,
            },
        };
    }

    static toAdmin(job: any): JobAdmin {
        const arTr = job.translations?.find((t: any) => t.language === 'ar') || {};
        const enTr = job.translations?.find((t: any) => t.language === 'en') || {};

        const hasArTitle = Boolean(arTr.title?.trim());
        const hasArSummary = Boolean(arTr.summary?.trim());
        const arStatus = hasArTitle && hasArSummary ? 'complete' : hasArTitle || hasArSummary ? 'partial' : 'missing';

        const hasEnTitle = Boolean(enTr.title?.trim());
        const hasEnSummary = Boolean(enTr.summary?.trim());
        const enStatus = hasEnTitle && hasEnSummary ? 'complete' : hasEnTitle || hasEnSummary ? 'partial' : 'missing';

        return {
            id: job.id,
            slug: job.slug,
            departmentId: job.departmentId,
            officeId: job.officeId || null,
            employmentType: job.employmentType,
            experienceMin: job.experienceMin || null,
            experienceMax: job.experienceMax || null,
            closesAt: job.closesAt || null,
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
            requirements: Array.isArray(job.requirements) ? job.requirements : [],
            benefits: Array.isArray(job.benefits) ? job.benefits : [],
            order: job.order ?? 0,
            isPublished: job.isPublished,
            publishedAt: job.publishedAt,
            ogImage: job.ogImage || null,
            noindex: job.noindex ?? false,
            title: { ar: arTr.title || '', en: enTr.title || '' },
            summary: { ar: arTr.summary || '', en: enTr.summary || '' },
            body: { ar: arTr.body || '', en: enTr.body || '' },
            location: { ar: arTr.location || '', en: enTr.location || '' },
            metaTitle: { ar: arTr.metaTitle || '', en: enTr.metaTitle || '' },
            metaDescription: { ar: arTr.metaDescription || '', en: enTr.metaDescription || '' },
            keywords: { ar: arTr.keywords || '', en: enTr.keywords || '' },
            department: job.department || undefined,
            office: job.office || null,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            translationStatus: {
                ar: arStatus,
                en: enStatus,
            },
        };
    }
}

// Backwards compatibility helpers
type JobWithTranslations = Prisma.JobGetPayload<{ include: { translations: true } }>;
type JobApplicationWithJob = Prisma.JobApplicationGetPayload<{
    include: { job: { include: { translations: true } } };
}>;

const TRANSLATABLE_FIELDS = ['title', 'summary', 'body', 'location'] as const;

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
    const { job, createdAt, updatedAt, notes, ...rest } = application;

    const sharedTranslations = withSharedLang(job.translations);
    const title = buildMultiLangField(sharedTranslations, 'title');

    return {
        ...rest,
        notes: (notes as any) ?? [],
        job: { title, slug: job.slug },
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
    } as unknown as JobApplicationModel;
};
