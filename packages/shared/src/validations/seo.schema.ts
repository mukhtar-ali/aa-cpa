import { z } from 'zod';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';
import { urlValidation } from './base.schema';

export const SeoContentSchema = z.object({
    title: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema.optional(),
    keywords: MultiLanguageFieldSchema.optional(),
    canonicalUrl: urlValidation.optional().or(z.literal('')),
    ogTitle: MultiLanguageFieldSchema.optional(),
    ogDescription: MultiLanguageFieldSchema.optional(),
    ogType: z.string().optional().or(z.literal('')),
    ogImage: urlValidation.optional().or(z.literal('')),
});

export const SeoSchema = z.object({
    pageKey: z.string().min(1),
    content: SeoContentSchema,
});

export const getDefaultSeoContent = (): z.infer<typeof SeoContentSchema> => ({
    title: getDefaultMultiLanguageField(),
    description: getDefaultMultiLanguageField(),
    keywords: getDefaultMultiLanguageField(),
    canonicalUrl: '',
    ogTitle: getDefaultMultiLanguageField(),
    ogDescription: getDefaultMultiLanguageField(),
    ogType: 'website',
    ogImage: '',
});
