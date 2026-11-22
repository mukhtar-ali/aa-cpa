import { z } from 'zod';
import { MediaType } from '../enums';
import { createNewUuid } from '../utils';
import { urlValidation } from './base.schema';
import { MediaTypeSchema, getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';
import { getDefaultResonsiveFile, ResponsiveFileSchemaOptional } from './file.schema';

// Home page content model — mirrors wujud's HomepageContent/HeroSlide: a multi-slide hero
// carousel (image or YouTube video per slide), a Showcase block, and an About teaser block.

export const HomeHeroSlideSchema = z.object({
    id: z.string().uuid(),
    mediaType: MediaTypeSchema,
    image: ResponsiveFileSchemaOptional,
    youtubeVideoId: z.string().optional().or(z.literal('')),
    title: MultiLanguageFieldSchema,
    subtitle: MultiLanguageFieldSchema,
    ctaText: MultiLanguageFieldSchema,
    ctaLink: urlValidation.optional().or(z.literal('')),
    isActive: z.boolean().default(true),
});

export const getDefaultHomeHeroSlide = (): z.infer<typeof HomeHeroSlideSchema> => ({
    id: createNewUuid(),
    mediaType: MediaType.Image,
    image: getDefaultResonsiveFile(),
    youtubeVideoId: '',
    title: getDefaultMultiLanguageField(),
    subtitle: getDefaultMultiLanguageField(),
    ctaText: getDefaultMultiLanguageField(),
    ctaLink: '',
    isActive: true,
});

export const HomeHeroSectionSchema = z.object({
    slides: z.array(HomeHeroSlideSchema).default([]),
});

export const getDefaultHomeHeroSection = (): z.infer<typeof HomeHeroSectionSchema> => ({
    slides: [],
});

export const HomeShowcaseSchema = z.object({
    description: MultiLanguageFieldSchema,
    leftImage: ResponsiveFileSchemaOptional,
    middleImage: ResponsiveFileSchemaOptional,
    rightImage: ResponsiveFileSchemaOptional,
});

export const getDefaultHomeShowcaseSection = (): z.infer<typeof HomeShowcaseSchema> => ({
    description: getDefaultMultiLanguageField(),
    leftImage: getDefaultResonsiveFile(),
    middleImage: getDefaultResonsiveFile(),
    rightImage: getDefaultResonsiveFile(),
});

export const HomeAboutTeaserSchema = z.object({
    text: MultiLanguageFieldSchema,
    anchorLabel: MultiLanguageFieldSchema,
    anchorUrl: urlValidation.optional().or(z.literal('')),
    image: ResponsiveFileSchemaOptional,
});

export const getDefaultHomeAboutTeaserSection = (): z.infer<typeof HomeAboutTeaserSchema> => ({
    text: getDefaultMultiLanguageField(),
    anchorLabel: getDefaultMultiLanguageField(),
    anchorUrl: '',
    image: getDefaultResonsiveFile(),
});
