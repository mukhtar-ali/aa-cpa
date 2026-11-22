'use client';

import { useBaseMutation, UseMutationParams } from '@repo/ui';
import { customEnv } from '../utilities/customEnv';

export const useMutation = <T = unknown, Payload = unknown>(
    params: UseMutationParams<T>,
) => {
    const baseUrl = customEnv.BASE_URL!;
    return useBaseMutation<T, Payload>({
        baseUrl,
        ...params,
    });
};
