import type { ZodType } from 'zod';

export type ApiErrorKind = 'http' | 'timeout' | 'network' | 'contract';

/** Typed failure of a call to the API. `status` is 0 for timeout, network and contract errors. */
export class ApiError extends Error {
    constructor(
        readonly kind: ApiErrorKind,
        readonly path: string,
        readonly status = 0,
        message?: string,
    ) {
        super(message ?? `${kind} error calling ${path}${status ? ` (${status})` : ''}`);
        this.name = 'ApiError';
    }
    get isNotFound() {
        return this.status === 404;
    }
}

export interface ApiGetOptions<T> {
    lang: 'ar' | 'en';
    /** Cache tags used by on-demand revalidation. */
    tags?: string[];
    /** Editor preview token: bypasses the cache and includes unpublished content. */
    preview?: string;
    query?: Record<string, string | number | undefined>;
    /** Parses the response; a mismatch throws `ApiError('contract')` so drift is loud, not silent. */
    schema?: ZodType<T>;
    revalidate?: number;
    timeoutMs?: number;
}

const baseUrl = () => process.env.BASE_URL ?? 'http://localhost:3001';

function withQuery(path: string, lang: string, query: ApiGetOptions<unknown>['query']) {
    const params = new URLSearchParams({ lang });
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined && value !== '') params.set(key, String(value));
    }
    return `${path}${path.includes('?') ? '&' : '?'}${params.toString()}`;
}

async function request(path: string, init: RequestInit & { next?: unknown }, timeoutMs: number) {
    try {
        return await fetch(`${baseUrl()}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
        const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
        throw new ApiError(timedOut ? 'timeout' : 'network', path);
    }
}

/**
 * In a draft-mode request the editor's token (httpOnly cookie set by `/api/preview`) is sent so the API returns drafts. Outside a
 * request (build, `generateStaticParams`) `next/headers` throws and there is simply no preview.
 */
async function draftToken(): Promise<string | undefined> {
    try {
        const { draftMode, cookies } = await import('next/headers');
        if (!(await draftMode()).isEnabled) return undefined;
        return (await cookies()).get('cpa_preview_token')?.value;
    } catch {
        return undefined;
    }
}

export async function apiGet<T>(path: string, options: ApiGetOptions<T>): Promise<T> {
    if (options.preview === undefined) {
        const token = await draftToken();
        if (token) options = { ...options, preview: token };
    }
    const url = withQuery(path, options.lang, options.query);
    const headers: Record<string, string> = { 'Accept-Language': options.lang };
    if (options.preview) headers['X-Preview-Token'] = options.preview;

    const res = await request(
        url,
        {
            headers,
            ...(options.preview
                ? { cache: 'no-store' as const }
                : { next: { tags: options.tags ?? [], revalidate: options.revalidate ?? 3600 } }),
        },
        options.timeoutMs ?? 8000,
    );
    if (!res.ok) throw new ApiError('http', path, res.status);

    const json: unknown = await res.json();
    if (!options.schema) return json as T;
    const parsed = options.schema.safeParse(json);
    if (!parsed.success) throw new ApiError('contract', path, 0, `Response of ${path} does not match its contract`);
    return parsed.data;
}

export interface ApiPostResult<T = unknown> {
    ok: boolean;
    status: number;
    data?: T;
    /** Field errors from the API's `{ errors: [{ field: message }] }` shape. */
    fieldErrors: Record<string, string>;
    message?: string;
}

/** POST used by Server Actions: never throws on 4xx so the action can render field errors. */
export async function apiPost<T = unknown>(
    path: string,
    body: BodyInit,
    options: { lang: 'ar' | 'en'; clientIp?: string; timeoutMs?: number; json?: boolean },
): Promise<ApiPostResult<T>> {
    const headers: Record<string, string> = { 'Accept-Language': options.lang };
    if (options.json) headers['Content-Type'] = 'application/json';
    if (options.clientIp) headers['X-Forwarded-For'] = options.clientIp;
    const res = await request(withQuery(path, options.lang, undefined), { method: 'POST', headers, body, cache: 'no-store' }, options.timeoutMs ?? 15000);

    const payload = (await res.json().catch(() => ({}))) as {
        message?: string;
        errors?: Array<Record<string, string>>;
    } & Record<string, unknown>;
    const fieldErrors: Record<string, string> = {};
    for (const entry of payload.errors ?? []) Object.assign(fieldErrors, entry);
    return {
        ok: res.ok,
        status: res.status,
        data: res.ok ? (payload as T) : undefined,
        fieldErrors,
        message: typeof payload.message === 'string' ? payload.message : undefined,
    };
}
