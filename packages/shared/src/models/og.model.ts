import { z } from 'zod';
import { OgQuerySchema, OgTypeEnum, OgLangEnum } from '../validations/og.schema';

export type OgType = z.infer<typeof OgTypeEnum>;
export type OgLang = z.infer<typeof OgLangEnum>;
export type OgQueryModel = z.infer<typeof OgQuerySchema>;
