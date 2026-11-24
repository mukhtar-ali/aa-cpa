import { z } from 'zod';

export const OgTypeEnum = z.enum(['page', 'service', 'article', 'job']);
export const OgLangEnum = z.enum(['ar', 'en']);

export const OgQuerySchema = z.object({
    type: OgTypeEnum,
    key: z.string().min(1),
    lang: OgLangEnum.default('ar'),
});
