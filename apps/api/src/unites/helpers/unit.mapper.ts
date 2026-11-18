import { Prisma, UnitTranslation } from '@prisma/client';
import { buildMultiLangField, getUnitTranslatableKeys, LanguageEnum, UnitModel } from '@repo/shared';
import { withSharedLang } from '@/common/prisma-language.util';

type UnitWithTranslations = Prisma.UnitGetPayload<{ include: { translations: true } }>;

const buildOverViewFeatures = (translations: UnitTranslation[]): { en: string; ar: string }[] => {
    const en = (translations.find((t) => t.language === LanguageEnum.En)
        ?.overViewFeatures as string[] | null) ?? [];
    const ar = (translations.find((t) => t.language === LanguageEnum.Ar)
        ?.overViewFeatures as string[] | null) ?? [];
    const maxLen = Math.max(en.length, ar.length);
    return Array.from({ length: maxLen }, (_, i) => ({ en: en[i] ?? '', ar: ar[i] ?? '' }));
};

export const unitMapEntityToModel = (unit: UnitWithTranslations): UnitModel => {
    const { translations, projectId, isDeleted, deletedAt, createdAt, updatedAt, ...rest } = unit;
    void projectId;
    void isDeleted;
    void deletedAt;

    const sharedTranslations = withSharedLang(translations);
    const translatableFields = Object.fromEntries(
        getUnitTranslatableKeys().map((field) => [
            field,
            buildMultiLangField(sharedTranslations, field as keyof UnitTranslation),
        ]),
    );

    return {
        ...rest,
        ...translatableFields,
        overViewFeatures: buildOverViewFeatures(translations),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
    } as unknown as UnitModel;
};
