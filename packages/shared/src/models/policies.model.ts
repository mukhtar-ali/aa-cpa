import { z } from 'zod';
import { Localized } from '../utils/localized.type';
import { PolicySchema } from '../validations';

export type PolicyModel = z.infer<typeof PolicySchema>;
export type PolicyModelWeb = Localized<PolicyModel>;
