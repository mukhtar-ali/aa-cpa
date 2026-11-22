import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { getCurrentUser } from '@/lib/auth-api'

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async () => {
        const { accessToken, user, setUser, reset } = useAuthStore.getState().auth
        if (!accessToken) {
            throw redirect({ to: '/sign-in', search: { redirect: location.href } })
        }
        if (!user) {
            try {
                const me = await getCurrentUser()
                setUser(me)
            } catch {
                reset()
                throw redirect({ to: '/sign-in', search: { redirect: location.href } })
            }
        }
    },
    component: AuthenticatedLayout,
})
