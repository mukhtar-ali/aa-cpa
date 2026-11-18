import { z } from 'zod';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';
import { getDefaultResonsiveFile, ResponsiveFileSchemaOptional } from './file.schema';

export const MediaHeroSchema = z.object({
    backgroundImage: ResponsiveFileSchemaOptional,
    title: MultiLanguageFieldSchema,
    subtitle: MultiLanguageFieldSchema,
});

export const getMediaHeroSection = (): z.infer<typeof MediaHeroSchema> => ({
    title: getDefaultMultiLanguageField(),
    subtitle: getDefaultMultiLanguageField(),
    backgroundImage: getDefaultResonsiveFile(),
});
