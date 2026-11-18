import { z } from 'zod';
import { urlValidation } from './base.schema';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';
import { getDefaultResonsiveFile, getImageOrVideoResponsiveDefault, ImageOrVideoResponsiveSchema, ResponsiveFileSchemaOptional } from './file.schema';

export const CommunityPageSchema = z.object({
    heroImage: ResponsiveFileSchemaOptional.optional(),
    heroSmallTitle: MultiLanguageFieldSchema,
    downloadTitle: MultiLanguageFieldSchema,
    downloadDescription: MultiLanguageFieldSchema,
    downloadGooglePlayLink: urlValidation.optional(),
    downloadAppStoreLink: urlValidation.optional(),
    downloadImage: urlValidation.optional(),
    gallery: z.array(ImageOrVideoResponsiveSchema).default([getImageOrVideoResponsiveDefault()]),
});

export const getDefaultCommunityPage = (): z.infer<typeof CommunityPageSchema> => ({
    heroImage: getDefaultResonsiveFile(),
    heroSmallTitle: getDefaultMultiLanguageField(),
    downloadTitle: getDefaultMultiLanguageField(),
    downloadDescription: getDefaultMultiLanguageField(),
    gallery: [],
});
