import { Prisma, ProjectTranslation } from '@prisma/client';
import { buildMultiLangField, getProjectTranslatableKeys, LanguageEnum, ProjectModel } from '@repo/shared';
import { withSharedLang } from '@/common/prisma-language.util';
import { unitMapEntityToModel } from '@/unites/helpers/unit.mapper';

type ProjectWithTranslations = Prisma.ProjectGetPayload<{ include: { translations: true } }> & {
    units?: Prisma.UnitGetPayload<{ include: { translations: true } }>[];
};

interface AmenityRow {
    icon?: string;
    title: string;
    description: string;
}

const buildTags = (translations: ProjectTranslation[]): { en: string; ar: string }[] => {
    const en = (translations.find((t) => t.language === LanguageEnum.En)?.tags as string[] | null) ?? [];
    const ar = (translations.find((t) => t.language === LanguageEnum.Ar)?.tags as string[] | null) ?? [];
    const maxLen = Math.max(en.length, ar.length);
    return Array.from({ length: maxLen }, (_, i) => ({ en: en[i] ?? '', ar: ar[i] ?? '' }));
};

const buildAmenities = (
    translations: ProjectTranslation[],
): { icon?: string; title: { en: string; ar: string }; description: { en: string; ar: string } }[] => {
    const en = (translations.find((t) => t.language === LanguageEnum.En)?.amenities as unknown as AmenityRow[] | null) ?? [];
    const ar = (translations.find((t) => t.language === LanguageEnum.Ar)?.amenities as unknown as AmenityRow[] | null) ?? [];
    const maxLen = Math.max(en.length, ar.length);
    return Array.from({ length: maxLen }, (_, i) => ({
        icon: en[i]?.icon ?? ar[i]?.icon,
        title: { en: en[i]?.title ?? '', ar: ar[i]?.title ?? '' },
        description: { en: en[i]?.description ?? '', ar: ar[i]?.description ?? '' },
    }));
};

export const projectMapEntityToModel = (project: ProjectWithTranslations): ProjectModel => {
    const { translations, units, isDeleted, deletedAt, createdAt, updatedAt, ...rest } = project;
    void isDeleted;
    void deletedAt;

    const sharedTranslations = withSharedLang(translations);
    const translatableFields = Object.fromEntries(
        getProjectTranslatableKeys()
            .filter((field) => field !== 'tags')
            .map((field) => [field, buildMultiLangField(sharedTranslations, field as keyof ProjectTranslation)]),
    );

    return {
        ...rest,
        ...translatableFields,
        tags: buildTags(translations),
        amenities: buildAmenities(translations),
        units: units ? units.map(unitMapEntityToModel) : undefined,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
    } as unknown as ProjectModel;
};
