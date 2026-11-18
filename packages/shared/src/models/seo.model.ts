import { z } from 'zod';
import { SeoContentSchema, SeoSchema } from '../validations';
import { Localized } from '../utils/localized.type';

export type SeoContentModel = z.infer<typeof SeoContentSchema>;
export type SeoModel = z.infer<typeof SeoSchema>;
export type SeoModelWeb = Localized<SeoModel>;
