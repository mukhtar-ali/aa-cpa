import { z } from 'zod';
import { NewsFormSchema, NewsQuerySchema, NewsTagSchema } from '../validations/news.schema';
import { Localized } from '../utils/localized.type';

export type NewsTag = z.infer<typeof NewsTagSchema>;
export type NewsFormModel = z.infer<typeof NewsFormSchema>;
export type NewsQueryModel = z.infer<typeof NewsQuerySchema>;

export interface NewsModel extends NewsFormModel {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export type NewsModelWeb = Localized<NewsModel>;
