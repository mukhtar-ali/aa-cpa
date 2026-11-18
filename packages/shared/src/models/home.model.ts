import { z } from 'zod';
import { Localized } from '../utils/localized.type';
import { HomeAboutTeaserSchema, HomeHeroSectionSchema, HomeHeroSlideSchema, HomeShowcaseSchema } from '../validations';

export type HomeHeroSlideModel = z.infer<typeof HomeHeroSlideSchema>;
export type HomeHeroSectionModel = z.infer<typeof HomeHeroSectionSchema>;
export type HomeShowcaseSectionModel = z.infer<typeof HomeShowcaseSchema>;
export type HomeAboutTeaserSectionModel = z.infer<typeof HomeAboutTeaserSchema>;

export type HomeHeroSlideModelWeb = Localized<HomeHeroSlideModel>;
export type HomeHeroSectionModelWeb = Localized<HomeHeroSectionModel>;
export type HomeShowcaseSectionModelWeb = Localized<HomeShowcaseSectionModel>;
export type HomeAboutTeaserSectionModelWeb = Localized<HomeAboutTeaserSectionModel>;

export interface HomeModel {
    hero: HomeHeroSectionModel;
    showcase: HomeShowcaseSectionModel;
    aboutTeaser: HomeAboutTeaserSectionModel;
}

export type HomeModelWeb = Localized<HomeModel>;
