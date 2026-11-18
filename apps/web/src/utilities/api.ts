import { ApiOptions, ApiResponse, baseApi } from '@repo/ui';
import { customEnv } from './customEnv';
import { getCurrentLocale } from '@/dictionaries/server';

export const api = async <T = unknown>(
    endpoint: string,
    options: ApiOptions = {},
): Promise<ApiResponse<T>> => {
    const baseUrl = customEnv.BASE_URL!;
    const lang = await getCurrentLocale();
    return baseApi<T>(baseUrl, endpoint, lang, options);
};
