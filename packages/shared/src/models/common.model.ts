import { z } from 'zod';
import { EmailSettingsSchema, GlobalSeoSettingsSchema, MultiLanguageFieldSchema, WebsiteInfoSectionSchema } from '../validations';
import { Localized } from '../utils/localized.type';

export type MultiLanguageFieldModel = z.infer<typeof MultiLanguageFieldSchema>;
export type WebsiteInfoSectionModel = z.infer<typeof WebsiteInfoSectionSchema>;
export type WebsiteInfoSectionModelWeb = Localized<WebsiteInfoSectionModel>;
export type GlobalSeoSettingsModel = z.infer<typeof GlobalSeoSettingsSchema>;
export type GlobalSeoSettingsModelWeb = Localized<GlobalSeoSettingsModel>;
export type EmailSettingsModel = z.infer<typeof EmailSettingsSchema>;
