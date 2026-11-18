import { z } from 'zod';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema, RequiredTitleSchema } from './common.schema';
import { csvList, PaginationParamsSchema, queryBoolean } from './pagination.schema';
import { emailValidation, phoneValidation, urlValidation } from './base.schema';

export const EmploymentTypeSchema = z.enum(['full_time', 'part_time', 'contract', 'internship']);

export const JobTranslationSchema = z.object({
    title: RequiredTitleSchema,
    description: MultiLanguageFieldSchema,
    // HTML from the CKEditor rich-text field — sanitized server-side on write.
    body: MultiLanguageFieldSchema,
    location: MultiLanguageFieldSchema,
});

export const JobFormSchema = JobTranslationSchema.extend({
    employmentType: EmploymentTypeSchema,
    isPublished: z.boolean().optional(),
    slug: z.string().optional(),
});

export const getDefaultJobForm = (): z.infer<typeof JobFormSchema> => ({
    title: getDefaultMultiLanguageField(),
    description: getDefaultMultiLanguageField(),
    body: getDefaultMultiLanguageField(),
    location: getDefaultMultiLanguageField(),
    employmentType: 'full_time',
    isPublished: false,
    slug: undefined,
});

export const JobQuerySchema = PaginationParamsSchema.extend({
    isPublished: queryBoolean,
    employmentType: csvList(EmploymentTypeSchema),
});

export const JobApplicationFormSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: emailValidation,
    phone: phoneValidation.optional().or(z.literal('')),
    coverLetter: z.string().optional(),
});

export const JobApplicationStatusSchema = z.object({
    status: z.enum(['pending', 'reviewed', 'rejected', 'hired']),
    notes: z.string().optional(),
});

export const JobApplicationQuerySchema = PaginationParamsSchema.extend({
    jobId: z.string().uuid().optional(),
    status: z.enum(['pending', 'reviewed', 'rejected', 'hired']).optional(),
});

export const CareersPageWorkFieldSchema = z.object({
    title: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema,
});

export const CareersPageSettingsSchema = z.object({
    heroImage: urlValidation.optional().or(z.literal('')),
    heroTitle: MultiLanguageFieldSchema,
    heroDescription: MultiLanguageFieldSchema,
    whyTitle: MultiLanguageFieldSchema,
    whyDescription: MultiLanguageFieldSchema,
    whyImage: urlValidation.optional().or(z.literal('')),
    workFields: z.array(CareersPageWorkFieldSchema).default([]),
    ctaTitle: MultiLanguageFieldSchema,
    ctaDescription: MultiLanguageFieldSchema,
    ctaImage: urlValidation.optional().or(z.literal('')),
    notificationEmail: emailValidation.optional().or(z.literal('')),
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
