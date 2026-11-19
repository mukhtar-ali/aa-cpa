import { z } from 'zod';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';
import { getDefaultResonsiveFile, ResponsiveFileSchemaOptional } from './file.schema';

/** Hero block of a listing page (Projects, News): a title, a subtitle and an optional background image. */
export const PageHeroSchema = z.object({
    backgroundImage: ResponsiveFileSchemaOptional,
    title: MultiLanguageFieldSchema,
    subtitle: MultiLanguageFieldSchema,
});

export const getDefaultPageHero = (): z.infer<typeof PageHeroSchema> => ({
    title: getDefaultMultiLanguageField(),
    subtitle: getDefaultMultiLanguageField(),
    backgroundImage: getDefaultResonsiveFile(),
});
