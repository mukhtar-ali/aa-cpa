import { getDefaultResonsiveFile, ResponsiveFileSchemaOptional } from './file.schema';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';
import { z } from 'zod';
import { createNewUuid } from '../utils';
import { imageValidation, urlValidation } from './base.schema';

// About page content model — mirrors wujud's AboutPageSettings/AboutCoreValue/
// AboutBoardMember/AboutSuccessPartner: Hero, About Content, Mission & Vision, Core Values,
// Leadership, Partners.

export const AboutUsHeroSchema = z.object({
    backgroundImage: ResponsiveFileSchemaOptional,
    title: MultiLanguageFieldSchema,
    subtitle: MultiLanguageFieldSchema,
});

export const getAboutHeroSection = (): z.infer<typeof AboutUsHeroSchema> => ({
    title: getDefaultMultiLanguageField(),
    subtitle: getDefaultMultiLanguageField(),
    backgroundImage: getDefaultResonsiveFile(),
});

export const AboutContentSchema = z.object({
    bigImage: ResponsiveFileSchemaOptional,
    smallImage: ResponsiveFileSchemaOptional,
    bigImageTitle: MultiLanguageFieldSchema,
    smallImageTitle: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema,
});

export const getAboutContentSection = (): z.infer<typeof AboutContentSchema> => ({
    bigImage: getDefaultResonsiveFile(),
    smallImage: getDefaultResonsiveFile(),
    bigImageTitle: getDefaultMultiLanguageField(),
    smallImageTitle: getDefaultMultiLanguageField(),
    description: getDefaultMultiLanguageField(),
});

export const AboutMissionVisionCardSchema = z.object({
    image: ResponsiveFileSchemaOptional,
    title: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema,
});

export const getDefaultAboutMissionVisionCard = (): z.infer<typeof AboutMissionVisionCardSchema> => ({
    image: getDefaultResonsiveFile(),
    title: getDefaultMultiLanguageField(),
    description: getDefaultMultiLanguageField(),
});

export const AboutMissionVisionSchema = z.object({
    mission: AboutMissionVisionCardSchema,
    vision: AboutMissionVisionCardSchema,
});

export const getAboutMissionVisionSection = (): z.infer<typeof AboutMissionVisionSchema> => ({
    mission: getDefaultAboutMissionVisionCard(),
    vision: getDefaultAboutMissionVisionCard(),
});

export const AboutCoreValueItemSchema = z.object({
    id: z.string().uuid(),
    title: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema,
    icon: imageValidation.optional().or(z.literal('')),
});

export const getDefaultAboutCoreValueItem = (): z.infer<typeof AboutCoreValueItemSchema> => ({
    id: createNewUuid(),
    title: getDefaultMultiLanguageField(),
    description: getDefaultMultiLanguageField(),
    icon: '',
});

export const AboutCoreValuesSchema = z.object({
    title: MultiLanguageFieldSchema,
    items: z.array(AboutCoreValueItemSchema).default([]),
});

export const getAboutCoreValuesSection = (): z.infer<typeof AboutCoreValuesSchema> => ({
    title: getDefaultMultiLanguageField(),
    items: [],
});

export const AboutLeadershipItemSchema = z.object({
    id: z.string().uuid(),
    image: ResponsiveFileSchemaOptional,
    name: MultiLanguageFieldSchema,
    jobTitle: MultiLanguageFieldSchema,
    bio: MultiLanguageFieldSchema,
    linkedinUrl: urlValidation.optional().or(z.literal('')),
});

export const getDefaultAboutLeadershipItem = (): z.infer<typeof AboutLeadershipItemSchema> => ({
    id: createNewUuid(),
    image: getDefaultResonsiveFile(),
    name: getDefaultMultiLanguageField(),
    jobTitle: getDefaultMultiLanguageField(),
    bio: getDefaultMultiLanguageField(),
    linkedinUrl: '',
});

export const AboutLeadershipSchema = z.object({
    items: z.array(AboutLeadershipItemSchema).default([]),
});

export const getAboutLeadershipSection = (): z.infer<typeof AboutLeadershipSchema> => ({
    items: [],
});

export const AboutPartnerItemSchema = z.object({
    id: z.string().uuid(),
    image: imageValidation,
    title: MultiLanguageFieldSchema,
    websiteUrl: urlValidation.optional().or(z.literal('')),
});

export const getDefaultAboutPartnerItem = (): z.infer<typeof AboutPartnerItemSchema> => ({
    id: createNewUuid(),
    image: '',
    title: getDefaultMultiLanguageField(),
    websiteUrl: '',
});

export const AboutPartnersSchema = z.object({
    items: z.array(AboutPartnerItemSchema).default([]),
});

export const getAboutPartnersSection = (): z.infer<typeof AboutPartnersSchema> => ({
    items: [],
});
