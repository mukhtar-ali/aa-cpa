import { z } from 'zod';
import {
    ImageFieldSchema,
    ImageRefSchema,
    MultiLanguageFieldSchema,
    RequiredTitleSchema,
    SlugSchema,
} from './common.schema';

export const SectorStatItemSchema = z.object({
    label: MultiLanguageFieldSchema,
    value: MultiLanguageFieldSchema,
    note: MultiLanguageFieldSchema.optional(),
});

export const SectorPainPointItemSchema = z.object({
    title: MultiLanguageFieldSchema,
    body: MultiLanguageFieldSchema,
});

export const SectorFormSchema = z.object({
    slug: SlugSchema,
    icon: z.string().optional().or(z.literal('')),
    order: z.number().int().default(0),
    isPublished: z.boolean().default(false),
    publishedAt: z.union([z.string(), z.date()]).optional().nullable(),
    featured: z.boolean().default(false),
    bandImage: ImageFieldSchema.optional().nullable(),
    title: RequiredTitleSchema,
    summary: RequiredTitleSchema,
    bandTitle: MultiLanguageFieldSchema.optional(),
    bandBody: MultiLanguageFieldSchema.optional(),
    bandCtaLabel: MultiLanguageFieldSchema.optional(),
    stats: z.array(SectorStatItemSchema).default([]),
    painPoints: z.array(SectorPainPointItemSchema).default([]),
    serviceIds: z.array(z.string()).default([]),
    faqIds: z.array(z.string()).default([]),
});

export const SectorAdminSchema = SectorFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    translationStatus: z.object({
        ar: z.enum(['complete', 'partial', 'missing']),
        en: z.enum(['complete', 'partial', 'missing']),
    }),
    services: z.array(z.any()).optional(),
    faqs: z.array(z.any()).optional(),
});

export const SectorSummaryWebSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    href: z.string().optional(),
    icon: z.string().optional(),
    featured: z.boolean().optional(),
    bandImage: ImageRefSchema.optional(),
    bandTitle: z.string().optional(),
    bandBody: z.string().optional(),
    bandCtaLabel: z.string().optional(),
});

export const SectorDetailWebSchema = SectorSummaryWebSchema.extend({
    stats: z.array(z.object({
        label: z.string(),
        value: z.string(),
        note: z.string().optional(),
    })).optional(),
    painPoints: z.array(z.object({
        title: z.string(),
        body: z.string(),
    })).optional(),
    services: z.array(z.object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
    })).optional(),
    faqs: z.array(z.object({
        id: z.string(),
        question: z.string(),
        answer: z.string(),
    })).optional(),
    isFallback: z.boolean().optional(),
});
