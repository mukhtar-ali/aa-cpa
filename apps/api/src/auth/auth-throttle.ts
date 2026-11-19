export const DEFAULT_AUTH_THROTTLE_LIMIT = 10;
export const MAX_AUTH_THROTTLE_LIMIT = 10000;
export const AUTH_THROTTLE_TTL_MS = 15 * 60 * 1000;

export function resolveAuthThrottleLimit(
    env: Record<string, string | undefined> = process.env,
): number {
    if (env.NODE_ENV === 'production') {
        return DEFAULT_AUTH_THROTTLE_LIMIT;
    }

    const raw = env.AUTH_THROTTLE_LIMIT;
    if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
        return DEFAULT_AUTH_THROTTLE_LIMIT;
    }

    const parsed = Number(raw);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_AUTH_THROTTLE_LIMIT) {
        return DEFAULT_AUTH_THROTTLE_LIMIT;
    }

    return parsed;
}

export function authThrottle(env: Record<string, string | undefined> = process.env) {
    return {
        default: {
            limit: resolveAuthThrottleLimit(env),
            ttl: AUTH_THROTTLE_TTL_MS,
        },
    };
}
