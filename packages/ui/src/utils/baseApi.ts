import { CookieEnum, getCookieSSR } from '../common';

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: unknown;
};

export type ApiOptions = RequestInit;

export const baseApi = async <T = unknown>(
    baseUrl: string,
    endpoint: string,
    acceptLanguage: 'en' | 'ar' = 'en',
    options: ApiOptions = {},
): Promise<ApiResponse<T>> => {
    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept-Language': acceptLanguage,
    };
    const token = await getCookieSSR(CookieEnum.token);
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
    };
    try {
        const response = await fetch(`${baseUrl}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
            return {
                success: false,
                error: data,
            };
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
};
