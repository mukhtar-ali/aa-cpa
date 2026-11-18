import type { PermissionEnum } from '@repo/shared'

export interface AuthUser {
    id: string
    email: string
    fullName: string
    username: string
    permissions: PermissionEnum[]
}

export interface AuthState {
    user: AuthUser | null
    accessToken: string
    isLoading: boolean
    error: string | null
}

export interface AuthActions {
    setUser: (user: AuthUser | null) => void
    setAccessToken: (token: string) => void
    resetAccessToken: () => void
    reset: () => void
    setIsLoading: (loading: boolean) => void
    setError: (error: string | null) => void
}

export interface AuthStore extends AuthState, AuthActions {}

export interface LoginResponse {
    token: string
    user: AuthUser
}
