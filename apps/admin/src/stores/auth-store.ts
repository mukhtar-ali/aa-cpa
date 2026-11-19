import type { AuthStore, AuthUser } from '@/types/auth'
import { create } from 'zustand'

const ACCESS_TOKEN_KEY = 'admin_access_token'
const USER_KEY = 'admin_user'

function getStoredToken(): string {
    if (typeof localStorage === 'undefined') return ''
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? ''
}

function getStoredUser(): AuthUser | null {
    try {
        if (typeof localStorage === 'undefined') return null
        const item = localStorage.getItem(USER_KEY)
        return item ? (JSON.parse(item) as AuthUser) : null
    } catch {
        return null
    }
}

interface AuthStoreState {
    auth: AuthStore
}

export const useAuthStore = create<AuthStoreState>()((set) => ({
    auth: {
        user: getStoredUser(),
        accessToken: getStoredToken(),
        isLoading: false,
        error: null,
        setUser: (user: AuthUser | null) =>
            set((state) => {
                if (user) {
                    localStorage.setItem(USER_KEY, JSON.stringify(user))
                } else {
                    localStorage.removeItem(USER_KEY)
                }
                return { auth: { ...state.auth, user } }
            }),
        setAccessToken: (accessToken: string) =>
            set((state) => {
                localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
                return { auth: { ...state.auth, accessToken } }
            }),
        resetAccessToken: () =>
            set((state) => {
                localStorage.removeItem(ACCESS_TOKEN_KEY)
                return { auth: { ...state.auth, accessToken: '' } }
            }),
        reset: () =>
            set((state) => {
                localStorage.removeItem(ACCESS_TOKEN_KEY)
                localStorage.removeItem(USER_KEY)
                return { auth: { ...state.auth, user: null, accessToken: '', error: null } }
            }),
        setIsLoading: (isLoading: boolean) =>
            set((state) => ({ auth: { ...state.auth, isLoading } })),
        setError: (error: string | null) =>
            set((state) => ({ auth: { ...state.auth, error } })),
    },
}))
