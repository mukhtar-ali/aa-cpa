import { z } from 'zod';
import { Localized } from '../utils/localized.type';
import { UnitFormSchema, UnitQuerySchema, UnitTranslationSchema, unitSchema } from '../validations';

export type UnitTranslatableKey = keyof z.infer<typeof UnitTranslationSchema>;

export const getUnitTranslatableKeys = (): UnitTranslatableKey[] =>
    Object.keys(UnitTranslationSchema.shape) as UnitTranslatableKey[];

export type UnitModel = z.infer<typeof unitSchema>;
export type UnitFormModel = z.infer<typeof UnitFormSchema>;
export type UnitQueryModel = z.infer<typeof UnitQuerySchema>;
export type UnitModelWeb = Localized<UnitModel>;
