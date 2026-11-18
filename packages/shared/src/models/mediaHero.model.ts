import { z } from 'zod';
import { Localized } from '../utils/localized.type';
import { MediaHeroSchema } from '../validations';

export type MediaHeroSectionModel = z.infer<typeof MediaHeroSchema>;
export type MediaHeroSectionModelWeb = Localized<MediaHeroSectionModel>;
