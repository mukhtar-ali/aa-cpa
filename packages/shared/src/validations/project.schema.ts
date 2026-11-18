import { z } from 'zod';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema, RequiredTitleSchema } from './common.schema';
import { PaginationParamsSchema, queryBoolean } from './pagination.schema';
import { getDefaultResonsiveFile, ResponsiveFileSchemaOptional } from './file.schema';
import { urlValidation } from './base.schema';

export const ProjectTranslationSchema = z.object({
    title: RequiredTitleSchema,
    subtitle: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema,
    location: MultiLanguageFieldSchema,
    tags: z.array(MultiLanguageFieldSchema),
});

export const ProjectAmenitySchema = z.object({
    icon: z.string().optional(),
    title: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema,
});

export const ProjectFormSchema = ProjectTranslationSchema.extend({
    heroMedia: ResponsiveFileSchemaOptional,
    thumbnail: urlValidation.optional().or(z.literal('')),
    amenities: z.array(ProjectAmenitySchema).default([]),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    slug: z.string().optional(),
});

export const getDefaultProjectForm = (): z.infer<typeof ProjectFormSchema> => ({
    title: getDefaultMultiLanguageField(),
    subtitle: getDefaultMultiLanguageField(),
    description: getDefaultMultiLanguageField(),
    location: getDefaultMultiLanguageField(),
    tags: [getDefaultMultiLanguageField()],
    heroMedia: getDefaultResonsiveFile(),
    thumbnail: '',
    amenities: [],
    isPublished: false,
    isFeatured: false,
    slug: undefined,
});

export const ProjectQuerySchema = PaginationParamsSchema.extend({
    isPublished: queryBoolean,
    isFeatured: queryBoolean,
});
