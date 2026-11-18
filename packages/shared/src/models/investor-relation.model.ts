import { z } from 'zod';
import { InvestorRelationPageSchema } from '../validations/investor-relation.schema';
import { Localized } from '../utils/localized.type';

export type InvestorRelationPageModel = z.infer<typeof InvestorRelationPageSchema>;
export type InvestorRelationPageModelWeb = Localized<InvestorRelationPageModel>;
