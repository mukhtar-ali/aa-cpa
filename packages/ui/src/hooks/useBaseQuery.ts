'use client';
import { registerTag } from '@repo/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getCookie, CookieEnum } from '../common';

interface UseQueryResponse<T> {
    data?: T;
    error?: unknown;
    isLoading: boolean;
    isSuccess: boolean;
    reFetch: () => void;
    trigger: () => void;
}

export interface UseQueryParams {
    endpoint?: string;
    providesTags?: string[];
    options?: RequestInit;
    lazy?: boolean;
    acceptLanguage?: 'en' | 'ar';
}

export const useBaseQuery = <T = unknown>({
    endpoint,
    providesTags,
    options,
    lazy = false,
    baseUrl,
    acceptLanguage = 'en',
}: UseQueryParams & { baseUrl: string }): UseQueryResponse<T> => {
    const [data, setData] = useState<T>();
    const [error, setError] = useState<unknown>();
    const [isLoading, setIsLoading] = useState(!lazy);
    const [isSuccess, setIsSuccess] = useState(false);
    const token = getCookie(CookieEnum.token);

    const fetchData = useCallback(async () => {
        if (!endpoint) return;

        setIsLoading(true);
        setError(undefined);
        setIsSuccess(false);

        try {
            const defaultHeaders: HeadersInit = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Accept-Language': acceptLanguage,
                ...(token && { Authorization: `Bearer ${token}` }),
            };

            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...(options?.headers || {}),
                },
                cache: 'no-store',
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || 'An error occurred');
                setError(result);
                return;
            }

            setData(result);
            setIsSuccess(true);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [acceptLanguage, baseUrl, endpoint, options, token]);

    const providesTagsRef = useRef(providesTags);
    providesTagsRef.current = providesTags;

    const handleProvidesTags = useCallback(() => {
        if (!providesTagsRef.current) return;
        providesTagsRef.current.forEach((tag) => registerTag(tag, fetchData));
    }, [fetchData]);

    useEffect(() => {
        if (!lazy) fetchData();
        handleProvidesTags();
    }, [fetchData, handleProvidesTags, lazy]);

    return {
        data,
        error,
        isLoading,
        isSuccess,
        reFetch: fetchData,
        trigger: fetchData,
    };
};
