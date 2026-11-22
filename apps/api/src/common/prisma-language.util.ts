import { LanguageEnum } from '@repo/shared';

/**
 * Prisma's generated `Language` enum is structurally identical to (but nominally
 * distinct from) `@repo/shared`'s `LanguageEnum` — both resolve to 'en' | 'ar' at
 * runtime, so this cast is safe. Used when passing Prisma translation rows into
 * shared helpers (e.g. `buildMultiLangField`) that are typed against `LanguageEnum`.
 */
export const withSharedLang = <T extends { language: unknown }>(
    rows: T[],
): (Omit<T, 'language'> & { language: LanguageEnum })[] =>
    rows as unknown as (Omit<T, 'language'> & { language: LanguageEnum })[];
