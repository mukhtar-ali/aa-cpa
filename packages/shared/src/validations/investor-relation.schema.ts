import { z } from 'zod';
import { createNewUuid } from '../utils';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';
import { ResponsiveFileSchemaOptional } from './file.schema';

export const InvestorRelationSchema = z.object({
    id: z.string().uuid(),
    title: MultiLanguageFieldSchema,
    url: MultiLanguageFieldSchema,
});

export const InvestorRelationPageSchema = z.object({
    title: MultiLanguageFieldSchema.optional(),
    smallTitle: MultiLanguageFieldSchema.optional(),
    description: MultiLanguageFieldSchema.optional(),
    image: ResponsiveFileSchemaOptional.optional(),
    irList: z.array(InvestorRelationSchema).default([]),
});

export const getDefaultInvestorRelation = (): z.infer<typeof InvestorRelationSchema> => ({
    id: createNewUuid(),
    title: getDefaultMultiLanguageField(),
    url: getDefaultMultiLanguageField(),
});

export const getDefaultInvestorRelationPage = (): z.infer<typeof InvestorRelationPageSchema> => ({
    title: getDefaultMultiLanguageField(),
    smallTitle: getDefaultMultiLanguageField(),
    description: getDefaultMultiLanguageField(),
    irList: [],
});
