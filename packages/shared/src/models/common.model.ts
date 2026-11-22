import { z } from 'zod';
import {
    ActionRefSchema,
    EmailSettingsSchema,
    GlobalSeoSettingsSchema,
    ImageFieldSchema,
    ImageRefSchema,
    LinkRefSchema,
    MultiLanguageFieldSchema,
    PublicFormGuardSchema,
    RequiredTitleSchema,
    SaudiMobileSchema,
    SlugSchema,
    WebsiteInfoSectionSchema,
} from '../validations';
import { Localized } from '../utils/localized.type';

export type MultiLanguageFieldModel = z.infer<typeof MultiLanguageFieldSchema>;
export type RequiredTitleModel = z.infer<typeof RequiredTitleSchema>;
export type SlugModel = z.infer<typeof SlugSchema>;
export type SaudiMobileModel = z.infer<typeof SaudiMobileSchema>;
export type ImageFieldModel = z.infer<typeof ImageFieldSchema>;
export type ImageRefModel = z.infer<typeof ImageRefSchema>;
export type LinkRefModel = z.infer<typeof LinkRefSchema>;
export type ActionRefModel = z.infer<typeof ActionRefSchema>;
export type PublicFormGuardModel = z.infer<typeof PublicFormGuardSchema>;
export type WebsiteInfoSectionModel = z.infer<typeof WebsiteInfoSectionSchema>;
export type WebsiteInfoSectionModelWeb = Localized<WebsiteInfoSectionModel>;
export type GlobalSeoSettingsModel = z.infer<typeof GlobalSeoSettingsSchema>;
export type GlobalSeoSettingsModelWeb = Localized<GlobalSeoSettingsModel>;
export type EmailSettingsModel = z.infer<typeof EmailSettingsSchema>;
