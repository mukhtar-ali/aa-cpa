import { z } from 'zod';
import { urlValidation } from './base.schema';
import {
    ImageFieldSchema,
    ImageRefSchema,
    MultiLanguageFieldSchema,
    RequiredTitleSchema,
    SlugSchema,
} from './common.schema';

export const ServiceHighlightSchema = z.object({
    label: MultiLanguageFieldSchema,
    value: MultiLanguageFieldSchema,
    note: MultiLanguageFieldSchema.optional(),
});

export const ServiceHighlightWebSchema = z.object({
    label: z.string(),
    value: z.string(),
    note: z.string().optional(),
});

export const ServiceMethodologyItemSchema = z.object({
    title: MultiLanguageFieldSchema,
    body: MultiLanguageFieldSchema,
});

export const ServiceDeliverableItemSchema = z.object({
    title: MultiLanguageFieldSchema,
    body: MultiLanguageFieldSchema.optional(),
});

export const ServiceFormSchema = z.object({
    slug: SlugSchema,
    image: ImageFieldSchema.optional().nullable(),
    heroImage: ImageFieldSchema.optional().nullable(),
    icon: z.string().optional().or(z.literal('')),
    highlight: ServiceHighlightSchema.optional().nullable(),
    methodology: z.array(ServiceMethodologyItemSchema).default([]),
    deliverables: z.array(ServiceDeliverableItemSchema).default([]),
    order: z.number().int().default(0),
    isPublished: z.boolean().default(false),
    publishedAt: z.union([z.string(), z.date()]).optional().nullable(),
    title: RequiredTitleSchema,
    summary: RequiredTitleSchema,
    heroSubtitle: MultiLanguageFieldSchema.optional(),
    statement: MultiLanguageFieldSchema.optional(),
    audience: MultiLanguageFieldSchema.optional(),
    whyUs: MultiLanguageFieldSchema.optional(),
    metaTitle: MultiLanguageFieldSchema.optional(),
    metaDescription: MultiLanguageFieldSchema.optional(),
    keywords: MultiLanguageFieldSchema.optional(),
    ogImage: z.union([urlValidation, ImageFieldSchema, z.literal('')]).optional().nullable(),
    noindex: z.boolean().default(false).optional(),
    sectorIds: z.array(z.string()).default([]),
    faqIds: z.array(z.string()).default([]),
});

export const ServiceAdminSchema = ServiceFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    translationStatus: z.object({
        ar: z.enum(['complete', 'partial', 'missing']),
        en: z.enum(['complete', 'partial', 'missing']),
    }),
    sectors: z.array(z.any()).optional(),
    faqs: z.array(z.any()).optional(),
});

export const ServiceSummaryWebSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    image: ImageRefSchema.optional(),
    href: z.string().optional(),
    ctaLabel: z.string().optional(),
    highlight: ServiceHighlightWebSchema.optional(),
});

export const ServiceDetailWebSchema = ServiceSummaryWebSchema.extend({
    heroSubtitle: z.string().optional(),
    statement: z.string().optional(),
    audience: z.string().optional(),
    whyUs: z.string().optional(),
    methodology: z.array(
        z.object({
            title: z.string(),
            body: z.string(),
        }),
    ),
    deliverables: z.array(
        z.object({
            title: z.string(),
            body: z.string().optional(),
        }),
    ),
    sectors: z
        .array(
            z.object({
                id: z.string(),
                slug: z.string(),
                title: z.string(),
            }),
        )
        .optional(),
    faqs: z
        .array(
            z.object({
                id: z.string(),
                question: z.string(),
                answer: z.string(),
            }),
        )
        .optional(),
    sharedCtas: z.any().optional(),
    partnerQuote: z.any().optional(),
    estimator: z.any().optional().nullable(),
    testimonial: z.any().optional().nullable(),
    seo: z.any().optional(),
    redirectTo: z.string().optional(),
    isFallback: z.boolean().optional(),
});
