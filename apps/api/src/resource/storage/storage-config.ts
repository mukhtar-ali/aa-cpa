import { safeHttpUrl } from '@repo/shared';
import type { StorageDriverName } from './storage-driver';

export const STORAGE_DRIVERS = ['local', 's3'] as const;

interface StorageEnv {
    STORAGE_DRIVER?: string;
    S3_BUCKET_NAME?: string;
}

/**
 * Which driver to use. An explicit STORAGE_DRIVER wins; otherwise S3 when a bucket is configured and the local disk
 * when it is not, so a project without S3 credentials works out of the box. Anything else is a configuration error.
 */
export function resolveStorageDriverName(env: StorageEnv): StorageDriverName {
    const explicit = (env.STORAGE_DRIVER ?? '').trim().toLowerCase();
    if (explicit === '') return (env.S3_BUCKET_NAME ?? '').trim() !== '' ? 's3' : 'local';
    if (explicit === 'local' || explicit === 's3') return explicit;
    throw new Error(`STORAGE_DRIVER must be one of: ${STORAGE_DRIVERS.join(', ')}.`);
}

/** Production problems with the storage settings (empty when fine). Used by validateProductionEnv. */
export function storageEnvProblems(env: StorageEnv & { API_PUBLIC_URL?: string }): string[] {
    const problems: string[] = [];
    let driver: StorageDriverName | undefined;
    try {
        driver = resolveStorageDriverName(env);
    } catch (error) {
        problems.push((error as Error).message);
    }
    const apiUrl = env.API_PUBLIC_URL;
    if (driver === 'local') {
        if (apiUrl === undefined || apiUrl.trim() === '') {
            problems.push('API_PUBLIC_URL is required in production when files are stored on local disk (STORAGE_DRIVER=local).');
        } else if (safeHttpUrl(apiUrl) === undefined) {
            problems.push('API_PUBLIC_URL must be a valid http(s) URL.');
        }
    } else if (apiUrl !== undefined && apiUrl.trim() !== '' && safeHttpUrl(apiUrl) === undefined) {
        problems.push('API_PUBLIC_URL must be a valid http(s) URL when set.');
    }
    return problems;
}
