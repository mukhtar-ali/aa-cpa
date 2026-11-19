import { z } from 'zod';
import {
    ImageFieldSchema,
    ImageRefSchema,
    MultiLanguageFieldSchema,
    RequiredTitleSchema,
} from './common.schema';

// ==========================================
// 1. Office
// ==========================================
export const OfficeCoordinatesSchema = z.object({
    x: z.number(),
    y: z.number(),
});

export const OfficeFormSchema = z.object({
    city: RequiredTitleSchema,
    address: MultiLanguageFieldSchema,
    mapUrl: z.string().optional().nullable().or(z.literal('')),
    mapX: z.number().int().min(0).max(100).optional().nullable(),
    mapY: z.number().int().min(0).max(100).optional().nullable(),
    image: ImageFieldSchema.optional().nullable(),
    isHeadquarters: z.boolean().default(false),
    order: z.number().int().default(0),
    isPublished: z.boolean().default(true),
});

export const OfficeAdminSchema = OfficeFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const OfficeWebSchema = z.object({
    id: z.string(),
    city: z.string(),
    address: z.string(),
    mapHref: z.string().optional(),
    coordinates: OfficeCoordinatesSchema.optional(),
    image: ImageRefSchema.optional(),
    isHeadquarters: z.boolean().default(false),
});

// ==========================================
// 2. Testimonial
// ==========================================
export const TestimonialFormSchema = z.object({
    quote: RequiredTitleSchema,
    rating: z.number().int().min(1).max(5).optional().nullable(),
    name: RequiredTitleSchema,
    role: MultiLanguageFieldSchema,
    company: MultiLanguageFieldSchema.optional().nullable(),
    avatar: ImageFieldSchema.optional().nullable(),
    order: z.number().int().default(0),
    isPublished: z.boolean().default(true),
    placement: z.array(z.string()).default([]),
});

export const TestimonialAdminSchema = TestimonialFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const TestimonialWebSchema = z.object({
    id: z.string(),
    quote: z.string(),
    rating: z.number().int().optional(),
    name: z.string(),
    role: z.string(),
    company: z.string().optional(),
    avatar: ImageRefSchema.optional(),
    placement: z.array(z.string()).optional(),
});

// ==========================================
// 3. ClientLogo
// ==========================================
export const ClientLogoFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    logo: ImageFieldSchema,
    url: z.string().url().optional().nullable().or(z.literal('')),
    row: z.number().int().min(1).max(2).default(1),
    order: z.number().int().default(0),
    isPublished: z.boolean().default(true),
});

export const ClientLogoAdminSchema = ClientLogoFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const ClientLogoWebSchema = z.object({
    id: z.string(),
    name: z.string(),
    image: ImageRefSchema,
    href: z.string().optional(),
    row: z.number().optional(),
});

export const LogoItemWebSchema = ClientLogoWebSchema;

// ==========================================
// 4. Credential
// ==========================================
export const CredentialFormSchema = z.object({
    name: MultiLanguageFieldSchema,
    logo: ImageFieldSchema,
    url: z.string().url().optional().nullable().or(z.literal('')),
    order: z.number().int().default(0),
    isPublished: z.boolean().default(true),
});

export const CredentialAdminSchema = CredentialFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const CredentialWebSchema = z.object({
    id: z.string(),
    name: z.string(),
    image: ImageRefSchema,
    href: z.string().optional(),
});

// ==========================================
// 5. FaqItem
// ==========================================
export const FaqScopeEnum = z.enum(['global', 'contact', 'service']);

export const FaqItemFormSchema = z.object({
    question: RequiredTitleSchema,
    answer: MultiLanguageFieldSchema,
    scope: FaqScopeEnum,
    serviceId: z.string().optional().nullable(),
    order: z.number().int().default(0),
    isPublished: z.boolean().default(true),
});

export const FaqItemAdminSchema = FaqItemFormSchema.extend({
    id: z.string(),
    service: z
        .object({
            id: z.string(),
            title: MultiLanguageFieldSchema,
        })
        .optional()
        .nullable(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const FaqItemWebSchema = z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
    scope: z.string().optional(),
    serviceId: z.string().optional(),
});
