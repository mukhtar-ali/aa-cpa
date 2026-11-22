'use client';

import { useBaseQuery, UseQueryParams } from '@repo/ui';
import { customEnv } from '../utilities/customEnv';
import { useCurrentLocale } from '@/dictionaries/client';

export const useQuery = <T = unknown>(params: UseQueryParams) => {
    const baseUrl = customEnv.BASE_URL!;
    const lang = useCurrentLocale();

    return useBaseQuery<T>({
        baseUrl,
        acceptLanguage: lang,
        ...params,
    });
};
