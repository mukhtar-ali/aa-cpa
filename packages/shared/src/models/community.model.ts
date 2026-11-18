import { z } from 'zod';
import { Localized } from '../utils/localized.type';
import { CommunityPageSchema } from '../validations';

export type CommunityPageModel = z.infer<typeof CommunityPageSchema>;
export type CommunityPageModelWeb = Localized<CommunityPageModel>;
