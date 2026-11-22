import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: () => (
        <>
            <Outlet />
            <Toaster duration={5000} />
        </>
    ),
})
