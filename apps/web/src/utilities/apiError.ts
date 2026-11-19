/**
 * Message for a failed API call. The API answers validation errors with
 * `{ message: 'Validation failed', error: ['phone: Phone number must contain only digits'] }`;
 * the generic message alone tells a visitor nothing, so the first detail wins when there is one.
 */
export function apiErrorMessage(error: unknown, fallback = 'An error occurred'): string {
    const body = error as { message?: unknown; error?: unknown } | null | undefined;
    const detail = Array.isArray(body?.error) && typeof body.error[0] === 'string' ? body.error[0] : undefined;
    if (detail) return detail;
    return typeof body?.message === 'string' && body.message ? body.message : fallback;
}
