import { notFound } from 'next/navigation';
import { ApiError, apiGet } from './client';
import { tags } from './endpoints';
import type { Lang } from '@/src/lib/i18n/dictionaries';

/** Fetch a CMS page payload with its cache tag. A 404 from the API becomes the Next.js 404 page; other errors reach `error.tsx`. */
export async function getPage<T>(path: string, key: string, lang: Lang): Promise<T> {
    try {
        return await apiGet<T>(path, { lang, tags: [tags.page(key)] });
    } catch (error) {
        if (error instanceof ApiError && error.isNotFound) notFound();
        throw error;
    }
}

/** Same, but `null` instead of throwing, for `generateMetadata` (a failed fetch must not take the page down twice). */
export const tryGetPage = <T>(path: string, key: string, lang: Lang) => apiGet<T>(path, { lang, tags: [tags.page(key)] }).catch(() => null);
