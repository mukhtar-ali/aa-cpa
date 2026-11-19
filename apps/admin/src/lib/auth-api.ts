import {
    endpoint,
    type AdminAuthUserModel,
    type CanResetPasswordModel,
    type ChangeEmailModel,
    type ChangePasswordModel,
    type ChangeUsernameModel,
    type LoginModel,
    type ResetPasswordModel,
} from '@repo/shared'
import type { AuthUser, LoginResponse } from '@/types/auth'
import { api } from './api'

interface NestLoginResponse {
    token: string
}

export async function login(credentials: LoginModel): Promise<LoginResponse> {
    const res = await api.post<NestLoginResponse>(endpoint.auth.login, credentials)
    const token = res.data.token

    const meRes = await api.get<AdminAuthUserModel>(endpoint.auth.me, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const user: AuthUser = {
        id: meRes.data.id,
        email: meRes.data.email,
        fullName: meRes.data.fullName,
        username: meRes.data.username,
        permissions: meRes.data.premissions,
    }

    return { token, user }
}

export async function getCurrentUser(): Promise<AuthUser> {
    const res = await api.get<AdminAuthUserModel>(endpoint.auth.me)
    return {
        id: res.data.id,
        email: res.data.email,
        fullName: res.data.fullName,
        username: res.data.username,
        permissions: res.data.premissions,
    }
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(endpoint.auth.forgetPassword, { email })
    return res.data
}

export async function canResetPassword(data: CanResetPasswordModel): Promise<boolean> {
    const res = await api.post<boolean>(endpoint.auth.canResetPassword, data)
    return res.data
}

export async function resetPassword(data: ResetPasswordModel): Promise<{ token: string; message: string }> {
    const res = await api.post<{ token: string; message: string }>(endpoint.auth.resetPassword, data)
    return res.data
}

export async function changePassword(data: ChangePasswordModel): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(endpoint.auth.changePassword, data)
    return res.data
}

export async function updateFullName(fullName: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(endpoint.auth.updateFullName, { fullName })
    return res.data
}

export async function changeUsername(data: ChangeUsernameModel): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(endpoint.auth.changeUsername, data)
    return res.data
}

export async function changeEmail(data: ChangeEmailModel): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(endpoint.auth.changeEmail, data)
    return res.data
}

/**
 * Revokes the current session's refresh token server-side and clears its cookie.
 * The access token itself isn't revocable (stateless JWT) — clearing it from the auth
 * store, which callers do alongside this, is what actually stops this tab from acting
 * as the user; this call is what stops that browser from silently refreshing a new one.
 */
export async function logout(): Promise<void> {
    await api.post(endpoint.auth.logout)
}
