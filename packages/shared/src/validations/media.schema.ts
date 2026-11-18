import { z } from 'zod';
import { MediaType } from '../enums';
import { urlValidation } from './base.schema';
import { MediaTypeSchema, MultiLanguageFieldSchema } from './common.schema';
import { PaginationParamsSchema } from './pagination.schema';

export const MediaFormSchema = z.object({
    type: MediaTypeSchema,
    video: urlValidation.nullable().optional(),
    images: z.array(urlValidation).nullable().optional(),
    title: MultiLanguageFieldSchema,
    isHomepage: z.boolean().optional(),
    thumbnail: urlValidation.nullable().optional(),
});

export const MediaQuerySchema = PaginationParamsSchema.extend({
    type: z.nativeEnum(MediaType).optional(),
    isHomepage: z.boolean().optional(),
});
