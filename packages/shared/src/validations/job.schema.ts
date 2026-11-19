import { z } from 'zod';
import {
    getDefaultMultiLanguageField,
    MultiLanguageFieldSchema,
    PublicFormGuardSchema,
    RequiredTitleSchema,
    SaudiMobileSchema,
    SlugSchema,
} from './common.schema';
import { csvList, PaginationParamsSchema, queryBoolean } from './pagination.schema';
import { emailValidation } from './base.schema';

export const EmploymentTypeSchema = z.enum([
    'full_time',
    'part_time',
    'contract',
    'internship',
    'cooperative_training',
]);

export const JobDepartmentFormSchema = z.object({
    slug: SlugSchema,
    name: MultiLanguageFieldSchema,
    order: z.number().int().default(0),
});

export const JobDepartmentAdminSchema = JobDepartmentFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    _count: z.object({ jobs: z.number().int() }).optional(),
});

export const JobDepartmentWebSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
});

export const JobBenefitItemSchema = z.object({
    title: MultiLanguageFieldSchema,
    body: MultiLanguageFieldSchema,
});

export const JobTranslationSchema = z.object({
    title: RequiredTitleSchema,
    summary: MultiLanguageFieldSchema,
    body: MultiLanguageFieldSchema,
    location: MultiLanguageFieldSchema.optional(),
    metaTitle: MultiLanguageFieldSchema.optional(),
    metaDescription: MultiLanguageFieldSchema.optional(),
    keywords: MultiLanguageFieldSchema.optional(),
});

export const JobFormSchema = JobTranslationSchema.extend({
    slug: SlugSchema.optional(),
    departmentId: z.string().min(1, 'Department is required'),
    officeId: z.string().optional().nullable(),
    employmentType: EmploymentTypeSchema,
    experienceMin: z.number().int().optional().nullable(),
    experienceMax: z.number().int().optional().nullable(),
    closesAt: z.union([z.string(), z.date()]).optional().nullable(),
    responsibilities: z.array(MultiLanguageFieldSchema).default([]),
    requirements: z.array(MultiLanguageFieldSchema).default([]),
    benefits: z.array(JobBenefitItemSchema).default([]),
    order: z.number().int().default(0),
    isPublished: z.boolean().default(false),
    publishedAt: z.union([z.string(), z.date()]).optional().nullable(),
});

export const getDefaultJobForm = (): z.infer<typeof JobFormSchema> => ({
    title: getDefaultMultiLanguageField(),
    summary: getDefaultMultiLanguageField(),
    body: getDefaultMultiLanguageField(),
    location: getDefaultMultiLanguageField(),
    metaTitle: getDefaultMultiLanguageField(),
    metaDescription: getDefaultMultiLanguageField(),
    keywords: getDefaultMultiLanguageField(),
    slug: undefined,
    departmentId: '',
    officeId: null,
    employmentType: 'full_time',
    experienceMin: null,
    experienceMax: null,
    closesAt: null,
    responsibilities: [],
    requirements: [],
    benefits: [],
    order: 0,
    isPublished: false,
    publishedAt: null,
});

export const JobAdminSchema = JobFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    department: JobDepartmentAdminSchema.optional(),
    office: z.any().optional().nullable(),
    _count: z.object({ applications: z.number().int() }).optional(),
    translationStatus: z
        .object({
            ar: z.enum(['complete', 'partial', 'missing']),
            en: z.enum(['complete', 'partial', 'missing']),
        })
        .optional(),
});

export const JobSummaryWebSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    department: z.string(),
    city: z.string(),
    contract: z.string(),
    experience: z.string(),
    summary: z.string().optional(),
    closesAt: z.string().optional(),
    href: z.string().optional(),
});

export const JobDetailWebSchema = JobSummaryWebSchema.extend({
    body: z.string(),
    responsibilities: z.array(z.string()),
    requirements: z.array(z.string()),
    benefits: z
        .array(
            z.object({
                title: z.string(),
                body: z.string(),
            }),
        )
        .optional(),
    similarJobs: z.array(JobSummaryWebSchema).optional(),
    isOpen: z.boolean().default(true),
    isFallback: z.boolean().optional(),
});

export const JobQuerySchema = PaginationParamsSchema.extend({
    isPublished: queryBoolean,
    departmentId: z.string().optional(),
    department: z.string().optional(),
    employmentType: csvList(EmploymentTypeSchema),
    officeId: z.string().optional(),
    q: z.string().optional(),
});

export const JobApplicationStatusEnum = z.enum([
    'pending',
    'reviewed',
    'shortlisted',
    'interview',
    'offer',
    'hired',
    'rejected',
]);

export const JobApplicationSchema = PublicFormGuardSchema.extend({
    fullName: z.string().min(1, 'Full name is required').max(100),
    email: emailValidation,
    mobile: SaudiMobileSchema,
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    motivation: z.string().max(2000).optional().or(z.literal('')),
});

export const JobApplicationFormSchema = JobApplicationSchema;

export const JobApplicationStatusSchema = z.object({
    status: JobApplicationStatusEnum,
    assignedToId: z.string().optional().nullable(),
    notes: z.string().optional(),
});

export const JobApplicationNoteSchema = z.object({
    authorId: z.string(),
    body: z.string(),
    at: z.union([z.string(), z.date()]),
});

export const JobApplicationAdminSchema = z.object({
    id: z.string(),
    jobId: z.string(),
    job: z
        .object({
            id: z.string(),
            title: MultiLanguageFieldSchema,
        })
        .optional(),
    fullName: z.string(),
    email: z.string(),
    mobile: z.string(),
    linkedinUrl: z.string().optional().nullable(),
    motivation: z.string().optional().nullable(),
    resumeKey: z.string(),
    resumeName: z.string(),
    resumeSize: z.number(),
    language: z.string(),
    status: JobApplicationStatusEnum,
    assignedToId: z.string().optional().nullable(),
    assignedTo: z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .optional()
        .nullable(),
    notes: z.array(JobApplicationNoteSchema).default([]),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const JobApplicationQuerySchema = PaginationParamsSchema.extend({
    jobId: z.string().optional(),
    status: JobApplicationStatusEnum.optional(),
    q: z.string().optional(),
});

export const CareersPageWorkFieldSchema = z.object({
    title: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema,
});

export const CareersPageSettingsSchema = z.object({
    heroImage: z.string().optional().or(z.literal('')),
    heroTitle: MultiLanguageFieldSchema,
    heroDescription: MultiLanguageFieldSchema,
    whyTitle: MultiLanguageFieldSchema,
    whyDescription: MultiLanguageFieldSchema,
    whyImage: z.string().optional().or(z.literal('')),
    workFields: z.array(CareersPageWorkFieldSchema).default([]),
    ctaTitle: MultiLanguageFieldSchema,
    ctaDescription: MultiLanguageFieldSchema,
    ctaImage: z.string().optional().or(z.literal('')),
    notificationEmail: z.string().optional().or(z.literal('')),
});

export const getDefaultCareersPageSettings = (): z.infer<typeof CareersPageSettingsSchema> => ({
    heroImage: '',
    heroTitle: getDefaultMultiLanguageField(),
    heroDescription: getDefaultMultiLanguageField(),
    whyTitle: getDefaultMultiLanguageField(),
    whyDescription: getDefaultMultiLanguageField(),
    whyImage: '',
    workFields: [],
    ctaTitle: getDefaultMultiLanguageField(),
    ctaDescription: getDefaultMultiLanguageField(),
    ctaImage: '',
    notificationEmail: '',
});

