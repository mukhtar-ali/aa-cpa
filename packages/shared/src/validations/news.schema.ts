import { z } from 'zod';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema, RequiredTitleSchema } from './common.schema';
import { csvList, PaginationParamsSchema, queryBoolean } from './pagination.schema';
import { urlValidation } from './base.schema';

export const NewsTagSchema = z.enum(['news', 'event']);

export const NewsTranslationSchema = z.object({
    title: RequiredTitleSchema,
    excerpt: MultiLanguageFieldSchema,
    // HTML from the CKEditor rich-text field — sanitized server-side on write.
    body: MultiLanguageFieldSchema,
    metaTitle: MultiLanguageFieldSchema.optional(),
    metaDescription: MultiLanguageFieldSchema.optional(),
    keywords: MultiLanguageFieldSchema.optional(),
});

export const NewsFormSchema = NewsTranslationSchema.extend({
    thumbnail: urlValidation.optional().or(z.literal('')),
    tag: NewsTagSchema.default('news'),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    slug: z.string().optional(),
});

export const getDefaultNewsForm = (): z.infer<typeof NewsFormSchema> => ({
    title: getDefaultMultiLanguageField(),
    excerpt: getDefaultMultiLanguageField(),
    body: getDefaultMultiLanguageField(),
    metaTitle: getDefaultMultiLanguageField(),
    metaDescription: getDefaultMultiLanguageField(),
    keywords: getDefaultMultiLanguageField(),
    thumbnail: '',
    tag: 'news',
    isPublished: false,
    isFeatured: false,
    slug: undefined,
});

export const NewsQuerySchema = PaginationParamsSchema.extend({
    isPublished: queryBoolean,
    isFeatured: queryBoolean,
    tag: csvList(NewsTagSchema),
});
