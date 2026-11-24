import { z } from 'zod';
import {
    getDefaultMultiLanguageField,
    ImageFieldSchema,
    ImageRefSchema,
    MultiLanguageFieldSchema,
    RequiredTitleSchema,
    SlugSchema,
} from './common.schema';
import { csvList, PaginationParamsSchema, queryBoolean } from './pagination.schema';
import { urlValidation } from './base.schema';

export const NewsTagSchema = z.enum(['news', 'event']);

export const ArticleCategoryFormSchema = z.object({
    slug: SlugSchema,
    name: MultiLanguageFieldSchema,
    order: z.number().int().default(0),
    isCaseStory: z.boolean().default(false),
});

export const ArticleCategoryAdminSchema = ArticleCategoryFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const ArticleCategoryWebSchema = z.object({
    id: z.string().optional(),
    slug: z.string(),
    name: z.string(),
    isCaseStory: z.boolean().optional(),
});

export const AuthorFormSchema = z.object({
    name: MultiLanguageFieldSchema,
    role: MultiLanguageFieldSchema,
    bio: MultiLanguageFieldSchema.optional(),
    avatar: z.union([z.string(), ImageFieldSchema]).optional().nullable(),
    order: z.number().int().default(0),
});

export const AuthorAdminSchema = AuthorFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const AuthorWebSchema = z.object({
    name: z.string(),
    role: z.string().optional(),
    bio: z.string().optional(),
    avatar: ImageRefSchema.optional(),
});

export const TocItemSchema = z.object({
    id: z.string(),
    label: z.string(),
    index: z.number().optional(),
});

export const NewsTranslationSchema = z.object({
    title: RequiredTitleSchema,
    excerpt: MultiLanguageFieldSchema,
    body: MultiLanguageFieldSchema,
    metaTitle: MultiLanguageFieldSchema.optional(),
    metaDescription: MultiLanguageFieldSchema.optional(),
    keywords: MultiLanguageFieldSchema.optional(),
});

export const NewsFormSchema = NewsTranslationSchema.extend({
    thumbnail: z.union([z.string(), ImageFieldSchema]).optional().nullable(),
    categoryId: z.string().optional(),
    authorId: z.string().optional().nullable(),
    tag: NewsTagSchema.optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    slug: z.string().optional(),
    readingMinutes: z.number().int().optional().nullable(),
    tags: z.array(MultiLanguageFieldSchema).default([]),
    publishedAt: z.union([z.string(), z.date()]).optional().nullable(),
    tocEnabled: z.boolean().default(true),
    ogImage: z.union([urlValidation, ImageFieldSchema, z.literal('')]).optional().nullable(),
    noindex: z.boolean().default(false).optional(),
    sectorIds: z.array(z.string()).default([]),
    serviceIds: z.array(z.string()).default([]),
});

export const NewsAdminSchema = NewsFormSchema.extend({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    category: ArticleCategoryAdminSchema.optional().nullable(),
    author: AuthorAdminSchema.optional().nullable(),
    translationStatus: z.object({
        ar: z.enum(['complete', 'partial', 'missing']),
        en: z.enum(['complete', 'partial', 'missing']),
    }).optional(),
});

export const getDefaultNewsForm = (): z.infer<typeof NewsFormSchema> => ({
    title: getDefaultMultiLanguageField(),
    excerpt: getDefaultMultiLanguageField(),
    body: getDefaultMultiLanguageField(),
    metaTitle: getDefaultMultiLanguageField(),
    metaDescription: getDefaultMultiLanguageField(),
    keywords: getDefaultMultiLanguageField(),
    thumbnail: '',
    categoryId: undefined,
    authorId: undefined,
    tag: 'news',
    isPublished: false,
    isFeatured: false,
    slug: undefined,
    readingMinutes: undefined,
    ogImage: '',
    noindex: false,
    tags: [],
    publishedAt: undefined,
    tocEnabled: true,
    sectorIds: [],
    serviceIds: [],
});

export const ArticleSummaryWebSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    category: z.string(),
    date: z.string(),
    readingMinutes: z.number().optional(),
    image: ImageRefSchema,
    href: z.string(),
    excerpt: z.string().optional(),
    author: AuthorWebSchema.optional(),
    isFeatured: z.boolean().optional(),
    isCaseStory: z.boolean().optional(),
    sector: z.string().optional(),
    service: z.string().optional(),
});

export const ArticleDetailWebSchema = ArticleSummaryWebSchema.extend({
    body: z.string(),
    toc: z.array(TocItemSchema).optional(),
    tags: z.array(z.string()).optional(),
    related: z.array(ArticleSummaryWebSchema).optional(),
    seo: z.any().optional(),
    isFallback: z.boolean().optional(),
});

export const NewsQuerySchema = PaginationParamsSchema.extend({
    isPublished: queryBoolean,
    isFeatured: queryBoolean,
    tag: csvList(NewsTagSchema),
    categoryId: z.string().optional(),
    sectorId: z.string().optional(),
    serviceId: z.string().optional(),
    sector: z.string().optional(),
    service: z.string().optional(),
    q: z.string().optional(),
});
