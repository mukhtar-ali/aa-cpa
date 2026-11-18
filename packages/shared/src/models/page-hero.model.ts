import { z } from 'zod';
import { PageHeroSchema } from '../validations/page-hero.schema';
import { Localized } from '../utils/localized.type';

export type PageHeroModel = z.infer<typeof PageHeroSchema>;
export type PageHeroModelWeb = Localized<PageHeroModel>;
