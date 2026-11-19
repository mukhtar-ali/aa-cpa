import { z } from 'zod';
import {
    MultiLanguageFieldSchema,
    PublicFormGuardSchema,
    SaudiMobileSchema,
} from './common.schema';
import { csvList, PaginationParamsSchema } from './pagination.schema';
import { emailValidation } from './base.schema';

export const LeadStatusSchema = z.enum(['new', 'contacted', 'qualified', 'closed', 'spam']);

export const LeadSourceSchema = z.enum(['contact', 'estimator', 'service_page']);

export const ContactRequestSchema = PublicFormGuardSchema.extend({
    fullName: z.string().min(1, 'Full name is required').max(100),
    company: z.string().max(150).optional().or(z.literal('')),
    mobile: SaudiMobileSchema,
    email: emailValidation,
    serviceId: z.string().optional().nullable().or(z.literal('')),
    message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
    landingPath: z.string().max(500).optional().or(z.literal('')),
});

export const ContactFormSchema = ContactRequestSchema;

export const LeadNoteSchema = z.object({
    authorId: z.string(),
    body: z.string().min(1, 'Note body is required'),
    at: z.union([z.string(), z.date()]),
});

export const LeadUpdateSchema = z.object({
    status: LeadStatusSchema.optional(),
    assignedToId: z.string().optional().nullable(),
});

export const ConsentRecordSummarySchema = z.object({
    ipHash: z.string(),
    policyVersion: z.string(),
    consentedAt: z.union([z.string(), z.date()]),
    userAgent: z.string().optional(),
});

export const LeadAdminSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    company: z.string().optional().nullable(),
    mobile: z.string(),
    email: z.string(),
    serviceId: z.string().optional().nullable(),
    service: z
        .object({
            id: z.string(),
            title: MultiLanguageFieldSchema,
        })
        .optional()
        .nullable(),
    message: z.string().optional().nullable(),
    source: LeadSourceSchema,
    estimatorAnswers: z.record(z.string(), z.any()).optional().nullable(),
    estimatedRange: z
        .object({
            min: z.number(),
            max: z.number(),
            currency: z.string(),
        })
        .optional()
        .nullable(),
    language: z.string(),
    landingPath: z.string().optional().nullable(),
    status: LeadStatusSchema,
    assignedToId: z.string().optional().nullable(),
    assignedTo: z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .optional()
        .nullable(),
    notes: z.array(LeadNoteSchema).default([]),
    consentRecord: ConsentRecordSummarySchema.optional().nullable(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const LeadQuerySchema = PaginationParamsSchema.extend({
    status: csvList(LeadStatusSchema),
    source: csvList(LeadSourceSchema),
    serviceId: z.string().optional(),
    assignedToId: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    q: z.string().optional(),
});

export const ContactQuerySchema = LeadQuerySchema;
export const ContactStatusSchema = z.object({
    status: LeadStatusSchema,
});

export const ContactUsHeroSchema = z.object({
    backgroundImage: z.any().optional(),
    title: MultiLanguageFieldSchema,
    subtitle: MultiLanguageFieldSchema,
});

export const ContactUsFormSchema = z.object({
    title: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema,
});

export const getContactHeroSection = (): z.infer<typeof ContactUsHeroSchema> => ({
    title: { ar: '', en: '' },
    subtitle: { ar: '', en: '' },
    backgroundImage: undefined,
});

export const getContactFormSection = (): z.infer<typeof ContactUsFormSchema> => ({
    title: { ar: '', en: '' },
    description: { ar: '', en: '' },
});
