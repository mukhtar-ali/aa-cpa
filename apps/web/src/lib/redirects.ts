import { endpoint, RedirectMapWebSchema, type RedirectMapWeb } from '@repo/shared';

/** Cache tag the API revalidates when a redirect changes (feature 004, research R4). */
export const REDIRECTS_TAG = 'redirects';

const TTL_MS = 60_000;
let cached: { at: number; map: RedirectMapWeb } | null = null;

/** Lower-cased path without query, fragment or trailing slash (`/` stays `/`), the form the API stores. */
export function normalizePath(pathname: string): string {
    const path = pathname.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '');
    return path === '' ? '/' : path;
}

/**
 * Redirect map from the API, cached in the process for a minute and in the Next data cache under the `redirects` tag.
 * Fails open: when the API is unreachable the last known map (or none) is used, so a redirect lookup can never take a page down.
 */
export async function getRedirectMap(): Promise<RedirectMapWeb> {
    if (cached && Date.now() - cached.at < TTL_MS) return cached.map;
    try {
        const base = process.env.BASE_URL ?? 'http://localhost:3001';
        const res = await fetch(`${base}${endpoint.redirects.map}`, {
            signal: AbortSignal.timeout(2000),
            next: { revalidate: 60, tags: [REDIRECTS_TAG] },
        } as RequestInit);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const parsed = RedirectMapWebSchema.safeParse(await res.json());
        if (!parsed.success) throw new Error('contract mismatch');
        cached = { at: Date.now(), map: parsed.data };
    } catch (error) {
        console.error('[redirects] could not load the redirect map', error);
        cached = { at: Date.now() - TTL_MS + 10_000, map: cached?.map ?? {} };
    }
    return cached.map;
}

export interface RedirectMatch {
    /** The map key that matched (what the API stores), which may differ from the request path by its locale prefix. */
    key: string;
    location: string;
    status: 307 | 308;
}

const LOCALE_PREFIX = /^\/(ar|en)(?=\/|$)/;

/**
 * Resolves a request path against the map. Entries may be locale-free (`/services/old`, which is how slug changes are stored)
 * or carry a locale (`/ar/services/old`); a locale-free hit keeps the visitor's language by re-prefixing an internal target.
 * Internal targets keep the visitor's query string; absolute ones are used as is.
 */
export function matchRedirect(map: RedirectMapWeb, pathname: string, search = ''): RedirectMatch | null {
    const path = normalizePath(pathname);
    let key = path;
    let hit = map[path];
    let locale: string | undefined;
    if (!hit) {
        const m = LOCALE_PREFIX.exec(path);
        if (m) {
            locale = m[1];
            key = normalizePath(path.slice(m[0].length) || '/');
            hit = map[key];
        }
    }
    if (!hit) return null;
    const external = /^https?:\/\//i.test(hit.to);
    const target = !external && locale && !LOCALE_PREFIX.test(hit.to) ? `/${locale}${hit.to}` : hit.to;
    return { key, location: external ? target : `${target}${search}`, status: hit.type === 'permanent' ? 308 : 307 };
}

/** Test hook. */
export function resetRedirectCache() {
    cached = null;
}

/**
 * Tells the API a redirect was served so the admin can see which legacy URLs are still used (hypercare). Fire and forget: it must
 * never slow down or break the redirect itself.
 */
export function reportRedirectHit(pathname: string): void {
    try {
        const base = process.env.BASE_URL ?? 'http://localhost:3001';
        void fetch(`${base}${endpoint.redirects.hit}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ path: normalizePath(pathname) }),
            signal: AbortSignal.timeout(1500),
        }).catch(() => undefined);
    } catch {
        // ignore
    }
}
