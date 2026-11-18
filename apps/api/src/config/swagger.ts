export function isSwaggerEnabled(
    env: Record<string, string | undefined> = process.env,
): boolean {
    return env.NODE_ENV !== 'production' || env.SWAGGER_ENABLED === 'true';
}
