import { z } from 'zod';
import { Localized } from '../utils/localized.type';
import {
    AboutContentSchema, AboutCoreValueItemSchema, AboutCoreValuesSchema, AboutLeadershipItemSchema,
    AboutLeadershipSchema, AboutMissionVisionSchema, AboutPartnerItemSchema, AboutPartnersSchema,
    AboutUsHeroSchema,
} from '../validations';

export type AboutHeroSectionModel = z.infer<typeof AboutUsHeroSchema>;
export type AboutContentSectionModel = z.infer<typeof AboutContentSchema>;
export type AboutMissionVisionSectionModel = z.infer<typeof AboutMissionVisionSchema>;
export type AboutCoreValuesSectionModel = z.infer<typeof AboutCoreValuesSchema>;
export type AboutCoreValueItemModel = z.infer<typeof AboutCoreValueItemSchema>;
export type AboutLeadershipSectionModel = z.infer<typeof AboutLeadershipSchema>;
export type AboutLeadershipItemModel = z.infer<typeof AboutLeadershipItemSchema>;
export type AboutPartnersSectionModel = z.infer<typeof AboutPartnersSchema>;
export type AboutPartnerItemModel = z.infer<typeof AboutPartnerItemSchema>;

export type AboutHeroSectionModelWeb = Localized<AboutHeroSectionModel>;
export type AboutContentSectionModelWeb = Localized<AboutContentSectionModel>;
export type AboutMissionVisionSectionModelWeb = Localized<AboutMissionVisionSectionModel>;
export type AboutCoreValuesSectionModelWeb = Localized<AboutCoreValuesSectionModel>;
export type AboutCoreValueItemModelWeb = Localized<AboutCoreValueItemModel>;
export type AboutLeadershipSectionModelWeb = Localized<AboutLeadershipSectionModel>;
export type AboutLeadershipItemModelWeb = Localized<AboutLeadershipItemModel>;
export type AboutPartnersSectionModelWeb = Localized<AboutPartnersSectionModel>;
export type AboutPartnerItemModelWeb = Localized<AboutPartnerItemModel>;

export interface AboutModel {
    hero: AboutHeroSectionModel;
    content: AboutContentSectionModel;
    missionVision: AboutMissionVisionSectionModel;
    coreValues: AboutCoreValuesSectionModel;
    leadership: AboutLeadershipSectionModel;
    partners: AboutPartnersSectionModel;
}

export type AboutModelWeb = Localized<AboutModel>;
