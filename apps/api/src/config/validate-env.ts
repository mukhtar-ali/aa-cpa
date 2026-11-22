import { safeHttpUrl } from '@repo/shared';
import { isS3AclSetting, S3_ACL_SETTINGS } from '../resource/s3-acl';
import { storageEnvProblems } from '../resource/storage/storage-config';
import { MAX_TRUSTED_PROXY_HOPS, parseTrustProxy } from './trust-proxy';

export const MIN_SECRET_LENGTH = 32;

export const SECRET_PLACEHOLDER_PATTERN =
    /change[-_ ]?me|changeme|placeholder|example|your[-_ ]?secret|replace[-_ ]?me|secret$/i;

function validateSecret(
    name: string,
    value: string,
    problems: string[],
): void {
    if (value.trim() === '') {
        problems.push(`${name} must not be empty in production.`);
        return;
    }

    if (value.length < MIN_SECRET_LENGTH) {
        problems.push(
            `${name} must be at least ${MIN_SECRET_LENGTH} characters long in production.`,
        );
    }

    if (SECRET_PLACEHOLDER_PATTERN.test(value)) {
        problems.push(`${name} must not be a placeholder value in production.`);
    }
}

function isValidHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value);
        return (
            (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
            Boolean(parsed.host)
        );
    } catch {
        return false;
    }
}

function validateOriginUrl(
    name: string,
    raw: string | undefined,
    problems: string[],
): void {
    if (!raw || raw.trim() === '') {
        problems.push(`${name} must be explicitly set in production.`);
        return;
    }

    if (!isValidHttpUrl(raw.trim())) {
        problems.push(`${name} must be a valid http(s) URL in production.`);
    }
}

export function validateProductionEnv(
    env: Record<string, string | undefined> = process.env,
): string[] {
    if (env.NODE_ENV !== 'production') {
        return [];
    }

    const problems: string[] = [];

    const jwtSecret = env.JWT_SECRET;
    if (jwtSecret === undefined || jwtSecret.trim() === '') {
        problems.push('JWT_SECRET is required and must not be empty in production.');
    } else {
        validateSecret('JWT_SECRET', jwtSecret, problems);
    }

    const csrfSecret = env.CSRF_SECRET;
    if (csrfSecret !== undefined && csrfSecret !== '') {
        validateSecret('CSRF_SECRET', csrfSecret, problems);
    }

    const databaseUrl = env.DATABASE_URL;
    if (databaseUrl === undefined || databaseUrl.trim() === '') {
        problems.push('DATABASE_URL is required and must not be empty in production.');
    }

    validateOriginUrl('ADMIN_PORTAL_URL', env.ADMIN_PORTAL_URL, problems);
    validateOriginUrl('FRONTEND_URL', env.FRONTEND_URL, problems);

    const s3Acl = env.S3_OBJECT_ACL;
    if (s3Acl !== undefined && s3Acl.trim() !== '' && !isS3AclSetting(s3Acl.trim().toLowerCase())) {
        problems.push(`S3_OBJECT_ACL must be one of: ${S3_ACL_SETTINGS.join(', ')}.`);
    }

    for (const name of ['S3_ENDPOINT', 'S3_PUBLIC_BASE_URL'] as const) {
        const value = env[name];
        if (value !== undefined && value.trim() !== '' && safeHttpUrl(value) === undefined) {
            problems.push(`${name} must be a valid http(s) URL when set.`);
        }
    }

    problems.push(...storageEnvProblems(env));

    const trustProxy = env.TRUST_PROXY;
    if (trustProxy !== undefined && trustProxy.trim() !== '' && parseTrustProxy(trustProxy) === false) {
        problems.push(
            `TRUST_PROXY must be the number of reverse-proxy hops (an integer from 1 to ${MAX_TRUSTED_PROXY_HOPS}); ` +
                "'true', '*' and address lists are refused because they let clients spoof their IP.",
        );
    }

    return problems;
}

export function assertProductionEnv(
    env: Record<string, string | undefined> = process.env,
): void {
    const problems = validateProductionEnv(env);
    if (problems.length > 0) {
        throw new Error(
            `Invalid production environment configuration:\n- ${problems.join('\n- ')}`,
        );
    }
}
