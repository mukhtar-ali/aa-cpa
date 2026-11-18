'use client';
import { useState } from 'react';
import { invalidateTag } from '@repo/shared';
import { toast } from 'react-toastify';
import { getCookie, CookieEnum } from '../common';

interface UseMutationResponse<T, Payload> {
    data?: T;
    error?: unknown;
    isLoading: boolean;
    isSuccess: boolean;
    mutate: (body?: Payload) => void;
    reset: () => void;
}

export interface UseMutationParams<T> {
    endpoint: string;
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    invalidatesTags?: string[];
    options?: RequestInit;
    onSuccess?: (data: T) => void;
    onError?: (error: unknown) => void;
}

/**
 * @param endpoint - The desired endpoint (e.g., "users" or "auth/login")
 * @param method - The HTTP method to use for the mutation (default: "POST")
 * @param invalidatesTags - Tags to invalidate after a successful mutation
 * @param options - Additional fetch options (headers, body, etc.)
 */
export const useBaseMutation = <T = unknown, Payload = unknown>({
    baseUrl,
    endpoint,
    method = 'POST',
    invalidatesTags,
    options,
    onSuccess,
    onError,
}: UseMutationParams<T> & { baseUrl: string }): UseMutationResponse<T, Payload> => {
    const [data, setData] = useState<T | undefined>(undefined);
    const [error, setError] = useState<unknown>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const token = getCookie(CookieEnum.token);
    const mutate = async (body?: Payload) => {
        setIsLoading(true);
        setIsSuccess(false);
        setError(undefined);
        try {
            const defaultHeaders: HeadersInit = {
                Accept: 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            };

            const isFormData = body instanceof FormData;

            const response = await fetch(`${baseUrl}${endpoint}`, {
                method,
                body: isFormData ? body : JSON.stringify(body),
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                    ...(options?.headers || {}),
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                setError(responseData);
                if (!onError) {
                    toast.error(responseData.message || 'An error occurred');
                } else {
                    onError(responseData);
                }
            } else {
                setData(responseData);
                setIsSuccess(true);
                onSuccess?.(responseData);
                invalidatesTags?.forEach((tag) => {
                    invalidateTag(tag);
                });
            }
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setIsSuccess(false);
        setData(undefined);
        setError(undefined);
        setIsLoading(false);
    };

    return { data, error, isLoading, isSuccess, mutate, reset };
};
