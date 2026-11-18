import { z } from 'zod';
import { MediaFormSchema, MediaQuerySchema } from '../validations';
import { Localized } from '../utils/localized.type';

export type MediaFormModel = z.infer<typeof MediaFormSchema>;
export type MediaQueryModel = z.infer<typeof MediaQuerySchema>;
export type MediaModel = MediaFormModel & { id: string; createdAt: string; updatedAt: string };
export type MediaModelWeb = Localized<MediaModel>;
