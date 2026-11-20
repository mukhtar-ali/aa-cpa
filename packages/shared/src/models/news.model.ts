import { z } from 'zod';
import {
    ArticleCategoryAdminSchema,
    ArticleCategoryFormSchema,
    ArticleCategoryWebSchema,
    ArticleDetailWebSchema,
    ArticleSummaryWebSchema,
    AuthorAdminSchema,
    AuthorFormSchema,
    AuthorWebSchema,
    NewsAdminSchema,
    NewsFormSchema,
    NewsQuerySchema,
    NewsTagSchema,
    TocItemSchema,
} from '../validations/news.schema';
import { Localized } from '../utils/localized.type';

export type NewsTag = z.infer<typeof NewsTagSchema>;
export type ArticleCategoryFormModel = z.infer<typeof ArticleCategoryFormSchema>;
export type ArticleCategoryAdminModel = z.infer<typeof ArticleCategoryAdminSchema>;
export type ArticleCategoryWeb = z.infer<typeof ArticleCategoryWebSchema>;
export type ArticleCategoryAdmin = ArticleCategoryAdminModel;
export type ArticleCategoryForm = ArticleCategoryFormModel;

export type AuthorFormModel = z.infer<typeof AuthorFormSchema>;
export type AuthorAdminModel = z.infer<typeof AuthorAdminSchema>;
export type AuthorWeb = z.infer<typeof AuthorWebSchema>;
export type AuthorAdmin = AuthorAdminModel;
export type AuthorForm = AuthorFormModel;

export type TocItem = z.infer<typeof TocItemSchema>;

export type NewsFormModel = z.infer<typeof NewsFormSchema>;
export type NewsAdminModel = z.infer<typeof NewsAdminSchema>;
export type NewsAdmin = NewsAdminModel;
export type NewsQueryModel = z.infer<typeof NewsQuerySchema>;

export type ArticleSummaryWeb = z.infer<typeof ArticleSummaryWebSchema>;
export type ArticleDetailWeb = z.infer<typeof ArticleDetailWebSchema>;

export interface NewsModel extends NewsFormModel {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export type NewsModelWeb = Localized<NewsModel>;
