import { z } from 'zod';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';
import { PaginationParamsSchema } from './pagination.schema';
import { urlValidation } from './base.schema';
import { createNewUuid } from '../utils';

export const LocationHighlightItemBaseSchema = z.object({
    id: z.string().optional(),
    title: MultiLanguageFieldSchema.optional(),
    icon: urlValidation.optional(),
});

export const LocationHighlightItemSchema = LocationHighlightItemBaseSchema.transform((item) => ({
    ...item,
    id: item.title?.en || item.title?.ar || item.icon ? item.id || createNewUuid() : '',
}));

export const getDefaultLocationHighlight = (): z.infer<typeof LocationHighlightItemSchema> => ({
    id: createNewUuid(),
    title: getDefaultMultiLanguageField(),
    icon: '',
});

export const LocationHighlightsSchema = z.array(LocationHighlightItemSchema).default([]);

export const GeoJsonSchema = z.object({
    type: z.literal('FeatureCollection'),
    features: z.array(
        z.object({
            type: z.literal('Feature'),
            properties: z.object({}),
            geometry: z.object({
                type: z.literal('Polygon'),
                coordinates: z.array(
                    z.array(z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])).min(4),
                ),
            }),
        }),
    ).min(1),
});

export const LocationGroupFormSchema = z.object({
    title: MultiLanguageFieldSchema,
    areaName: MultiLanguageFieldSchema.optional(),
    description: MultiLanguageFieldSchema.optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    highlights: LocationHighlightsSchema.optional(),
    zoom: z.number(),
});

export const LocationGroupQuerySchema = PaginationParamsSchema;
