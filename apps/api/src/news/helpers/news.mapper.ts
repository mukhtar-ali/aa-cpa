import { Prisma } from '@prisma/client';
import { buildMultiLangField, NewsModel } from '@repo/shared';
import { withSharedLang } from '@/common/prisma-language.util';

type NewsWithTranslations = Prisma.NewsGetPayload<{ include: { translations: true } }>;

const TRANSLATABLE_FIELDS = ['title', 'excerpt', 'body', 'metaTitle', 'metaDescription', 'keywords'] as const;

export const newsMapEntityToModel = (news: NewsWithTranslations): NewsModel => {
    const { translations, isDeleted, deletedAt, createdAt, updatedAt, ...rest } = news;
    void isDeleted;
    void deletedAt;

    const sharedTranslations = withSharedLang(translations);
    const translatableFields = Object.fromEntries(
        TRANSLATABLE_FIELDS.map((field) => [field, buildMultiLangField(sharedTranslations, field)]),
    );

    return {
        ...rest,
        ...translatableFields,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
    } as unknown as NewsModel;
};
