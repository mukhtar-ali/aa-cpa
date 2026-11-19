/**
 * CSRF token fetch + cache, for the two cookie-based auth endpoints only
 * (POST /api/auth/refresh, POST /api/auth/logout — see apps/api's csrf.middleware.ts for
 * why the scope is narrow rather than global).
 */
import axios from 'axios'
import { endpoint } from '@repo/shared'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

let csrfTokenCache: string | null = null
let csrfFetchPromise: Promise<string | null> | null = null

export async function getCsrfToken(): Promise<string | null> {
    if (csrfTokenCache) return csrfTokenCache
    if (csrfFetchPromise) return csrfFetchPromise

    csrfFetchPromise = (async () => {
        try {
            const res = await axios.get<{ csrfToken: string }>(`${API_BASE_URL}${endpoint.auth.csrfToken}`, {
                withCredentials: true,
            })
            csrfTokenCache = res.data.csrfToken
            return csrfTokenCache
        } catch {
            return null
        } finally {
            csrfFetchPromise = null
        }
    })()

    return csrfFetchPromise
}

export function invalidateCsrfToken(): void {
    csrfTokenCache = null
}
