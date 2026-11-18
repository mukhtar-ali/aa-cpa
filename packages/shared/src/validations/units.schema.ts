import { z } from 'zod';
import { createNewUuid } from '../utils';
import { MultiLanguageFieldSchema, RequiredTitleSchema, getDefaultMultiLanguageField } from './common.schema';
import { getImageOrVideoResponsiveDefault, ImageOrVideoResponsiveSchema } from './file.schema';
import { PaginationParamsSchema, queryBoolean } from './pagination.schema';

export const UnitTranslationSchema = z.object({
    title: RequiredTitleSchema,
    type: MultiLanguageFieldSchema,
    area: MultiLanguageFieldSchema,
    view: MultiLanguageFieldSchema,
    delivery: MultiLanguageFieldSchema,
    status: MultiLanguageFieldSchema,
    floor: MultiLanguageFieldSchema,
    building: MultiLanguageFieldSchema,
    overViewTitle: MultiLanguageFieldSchema,
    overViewDescription: MultiLanguageFieldSchema,
});

export const UnitFormSchema = UnitTranslationSchema.extend({
    id: z.string().uuid().optional(),
    overViewFeatures: z.array(MultiLanguageFieldSchema),
    thumbnail: z.string().optional(),
    overViewImage: z.string().optional(),
    price: z.string().optional(),
    pricePerMeter: z.string().optional(),
    gallery: z.array(ImageOrVideoResponsiveSchema).default([]),
    isPublished: z.boolean().default(false),
    slug: z.string().optional(),
    bedrooms: z.number().default(0),
    bathrooms: z.number().default(0),
});

export const unitSchema = UnitFormSchema.extend({
    id: z.string().uuid(),
});

export const UnitQuerySchema = PaginationParamsSchema.extend({
    projectId: z.string().uuid().optional(),
    isPublished: queryBoolean,
    bedrooms: z.number().optional(),
    priceSort: z.enum(['asc', 'desc']).optional(),
});

export function getDefaultUnit(): z.infer<typeof unitSchema> {
    return {
        id: createNewUuid(),
        title: getDefaultMultiLanguageField(),
        type: getDefaultMultiLanguageField(),
        area: getDefaultMultiLanguageField(),
        view: getDefaultMultiLanguageField(),
        delivery: getDefaultMultiLanguageField(),
        status: getDefaultMultiLanguageField(),
        floor: getDefaultMultiLanguageField(),
        building: getDefaultMultiLanguageField(),
        overViewTitle: getDefaultMultiLanguageField(),
        overViewDescription: getDefaultMultiLanguageField(),
        overViewFeatures: [getDefaultMultiLanguageField()],
        thumbnail: '',
        overViewImage: '',
        price: '',
        pricePerMeter: '',
        gallery: [getImageOrVideoResponsiveDefault()],
        isPublished: false,
        slug: '',
        bedrooms: 0,
        bathrooms: 0,
    };
}
