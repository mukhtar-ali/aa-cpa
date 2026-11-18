import { LanguageEnum } from '../enums';
import { MultiLanguageFieldModel } from '../models';

export const getLangValue = (
    field: MultiLanguageFieldModel | undefined,
    lang: LanguageEnum,
): string => {
    return field?.[lang] || '';
};

export const buildMultiLangField = <T extends { language: LanguageEnum }>(
    translations: T[],
    field: keyof T,
): MultiLanguageFieldModel => {
    const result: MultiLanguageFieldModel = { en: '', ar: '' };
    for (const t of translations) {
        result[t.language] = (t[field] as string) || '';
    }
    return result;
};
