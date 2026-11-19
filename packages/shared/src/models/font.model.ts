import { z } from 'zod';
import { FontListSchema, FontSchema } from '../validations/font.schema';

export type FontModel = z.infer<typeof FontSchema>;
export type FontModelWeb = Omit<FontModel, 'id'>;
export type FontListModel = z.infer<typeof FontListSchema>;
