import { z } from 'zod';
import {
    ActionRefSchema,
    ConsentTextsSchema,
    EmailSettingsSchema,
    GlobalSeoSchema,
    GlobalSeoSettingsSchema,
    ImageFieldSchema,
    ImageLicenseSchema,
    ImageRefSchema,
    LinkRefSchema,
    MultiLanguageFieldSchema,
    OrganizationSeoSchema,
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
export type GlobalSeoModel = GlobalSeoSettingsModel;
export type GlobalSeoSettingsModelWeb = Localized<GlobalSeoSettingsModel>;
export type GlobalSeoModelWeb = GlobalSeoSettingsModelWeb;
export type OrganizationSeoModel = z.infer<typeof OrganizationSeoSchema>;
export type ConsentTextsModel = z.infer<typeof ConsentTextsSchema>;
export type ImageLicenseModel = z.infer<typeof ImageLicenseSchema>;
export type EmailSettingsModel = z.infer<typeof EmailSettingsSchema>;
