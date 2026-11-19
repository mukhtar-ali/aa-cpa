import { z } from 'zod';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';

export const PolicySchema = z.object({
    content: MultiLanguageFieldSchema,
});

export const getDefaultPolicy = (): z.infer<typeof PolicySchema> => ({
    content: getDefaultMultiLanguageField(),
});
