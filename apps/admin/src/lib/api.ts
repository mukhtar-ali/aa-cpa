/**
 * API client with retry, bearer-token auth, and silent refresh-token renewal for the
 * NestJS API.
 *
 * The access token is a short-lived Bearer JWT held in memory/localStorage (via the
 * Zustand auth store) and sent as an Authorization header. The refresh token is an
 * httpOnly cookie the browser attaches automatically to /api/auth/refresh and
 * /api/auth/logout only (scoped by the API's cookie `path`) — this client never sees
 * its value. `withCredentials: true` is required globally so the browser both stores
 * that cookie on login and sends it back on refresh/logout.
 */
import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { endpoint } from '@repo/shared'
import { useAuthStore } from '@/stores/auth-store'
import { isTokenExpired } from './jwt'
import { getCsrfToken, invalidateCsrfToken } from './csrf'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryableStatuses: [500, 502, 503, 504],
} as const

// Only these two routes read the httpOnly refresh-token cookie — see apps/api's
// csrf.middleware.ts for why CSRF protection is scoped to just them.
const CSRF_PROTECTED_URLS = new Set<string>([endpoint.auth.refresh, endpoint.auth.logout])

const axiosInstance = axios.create({ baseURL: API_BASE_URL, withCredentials: true })

axiosInstance.interceptors.request.use(async (config) => {
    const { accessToken } = useAuthStore.getState().auth
    if (accessToken && !isTokenExpired(accessToken)) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    if (config.url && CSRF_PROTECTED_URLS.has(config.url)) {
        const csrfToken = await getCsrfToken()
        if (csrfToken) config.headers['x-csrf-token'] = csrfToken
    }

    return config
})

// Dedupe concurrent silent-refresh attempts across simultaneous 401s.
let refreshPromise: Promise<string | null> | null = null

function isCsrfRejection(error: unknown): boolean {
    const err = error as AxiosError<{ code?: string }> | undefined
    return err?.response?.status === 403 && err.response.data?.code === 'CSRF_INVALID_TOKEN'
}

async function requestNewAccessToken(): Promise<string> {
    const csrfToken = await getCsrfToken()
    const res = await axios.post<{ token: string }>(`${API_BASE_URL}${endpoint.auth.refresh}`, undefined, {
        withCredentials: true,
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : undefined,
    })
    return res.data.token
}

async function silentRefresh(): Promise<string | null> {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
        try {
            let token: string
            try {
                token = await requestNewAccessToken()
            } catch (error) {
                // A cached CSRF token can go stale (cookie cleared, API restarted, or it was issued
                // before the CSRF scheme changed). Refetch once and retry instead of signing the user out.
                if (!isCsrfRejection(error)) throw error
                invalidateCsrfToken()
                token = await requestNewAccessToken()
            }
            useAuthStore.getState().auth.setAccessToken(token)
            return token
        } catch {
            return null
        } finally {
            refreshPromise = null
        }
    })()

    return refreshPromise
}

function handleUnauthorized(): void {
    useAuthStore.getState().auth.reset()
    if (window.location.pathname !== '/sign-in') {
        window.location.href = '/sign-in'
    }
}

axiosInstance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const config = error.config as (AxiosRequestConfig & { _retried?: boolean; _csrfRetried?: boolean }) | undefined

        // CSRF token rejected (e.g. server restarted) — refetch once and retry.
        if (
            error.response?.status === 403 &&
            (error.response.data as { code?: string } | undefined)?.code === 'CSRF_INVALID_TOKEN' &&
            config &&
            !config._csrfRetried
        ) {
            invalidateCsrfToken()
            config._csrfRetried = true
            return axiosInstance(config)
        }

        if (error.response?.status === 401 && config && !config._retried && config.url !== endpoint.auth.refresh) {
            config._retried = true
            const newToken = await silentRefresh()
            if (newToken) {
                config.headers = { ...config.headers, Authorization: `Bearer ${newToken}` }
                return axiosInstance(config)
            }
            handleUnauthorized()
        } else if (error.response?.status === 401) {
            handleUnauthorized()
        }

        return Promise.reject(error)
    },
)

async function requestWithRetry<T>(
    fn: () => Promise<AxiosResponse<T>>,
    retries = 0,
): Promise<AxiosResponse<T>> {
    try {
        return await fn()
    } catch (error) {
        const axiosError = error as AxiosError
        const status = axiosError.response?.status ?? 0
        const shouldRetry =
            retries < RETRY_CONFIG.maxRetries &&
            (RETRY_CONFIG.retryableStatuses as readonly number[]).includes(status)

        if (!shouldRetry) throw error

        const delay = Math.min(RETRY_CONFIG.baseDelay * 2 ** retries, RETRY_CONFIG.maxDelay)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return requestWithRetry(fn, retries + 1)
    }
}

export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        requestWithRetry(() => axiosInstance.get<T>(url, config)),
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        requestWithRetry(() => axiosInstance.post<T>(url, data, config)),
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        requestWithRetry(() => axiosInstance.put<T>(url, data, config)),
    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        requestWithRetry(() => axiosInstance.patch<T>(url, data, config)),
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        requestWithRetry(() => axiosInstance.delete<T>(url, config)),
}
