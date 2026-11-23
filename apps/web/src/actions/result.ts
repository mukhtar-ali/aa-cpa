/** What every form Server Action returns. Never carries API internals, only a field map and a localized message key. */
export interface FormResult {
    ok: boolean;
    /** Field name → message from the API (already in the visitor's language). */
    fieldErrors?: Record<string, string>;
    /** `rateLimited` and `generic` map to dictionary labels; the API's own message is never shown. */
    error?: 'rateLimited' | 'generic' | 'invalid' | 'closed';
}

export const okResult: FormResult = { ok: true };

/** Map an `apiPost` outcome to a `FormResult` (422 → field errors, 429 → rate limited, anything else → generic). */
export function toFormResult(res: { ok: boolean; status: number; fieldErrors: Record<string, string> }): FormResult {
    if (res.ok) return okResult;
    if (res.status === 429) return { ok: false, error: 'rateLimited' };
    if (res.status === 422 || res.status === 400) return { ok: false, error: 'invalid', fieldErrors: res.fieldErrors };
    if (res.status === 410) return { ok: false, error: 'closed' };
    return { ok: false, error: 'generic' };
}
