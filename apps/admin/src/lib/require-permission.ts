import { redirect } from '@tanstack/react-router'
import type { PermissionEnum } from '@repo/shared'
import { useAuthStore } from '@/stores/auth-store'

/**
 * TanStack Router `beforeLoad` guard: redirects to /403 if the current user
 * lacks the given permission. Complements the sidebar's permission filtering
 * (which only hides links) by also blocking direct navigation to the URL.
 */
export function requirePermission(permission: PermissionEnum) {
    return () => {
        const { user } = useAuthStore.getState().auth
        if (!user?.permissions?.includes(permission)) {
            throw redirect({ to: '/403' })
        }
    }
}
