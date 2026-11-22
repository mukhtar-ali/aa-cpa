import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
import { ThemeProvider } from '@/context/theme-provider'
import { AuthProvider } from '@/context/auth-provider'
import { DirectionProvider } from '@/context/direction-provider'
import { FontProvider } from '@/context/font-provider'
import { routeTree } from './routeTree.gen'
import './styles/index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (import.meta.env.DEV) return false
                if (failureCount > 3) return false
                return !(error instanceof AxiosError && [401, 403, 429].includes(error.response?.status ?? 0))
            },
            refetchOnWindowFocus: import.meta.env.PROD,
            refetchOnMount: false,
            staleTime: import.meta.env.DEV ? 5 * 60 * 1000 : 10 * 1000,
        },
        mutations: {
            onError: (error) => {
                handleServerError(error)
                if (error instanceof AxiosError && error.response?.status === 304) {
                    toast.error('Content not modified!')
                }
            },
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
            if (error instanceof AxiosError && error.response?.status === 401) {
                useAuthStore.getState().auth.reset()
            }
        },
    }),
})

const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <DirectionProvider>
                    <FontProvider>
                        <AuthProvider>
                            <RouterProvider router={router} />
                        </AuthProvider>
                        {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
                    </FontProvider>
                </DirectionProvider>
            </ThemeProvider>
        </QueryClientProvider>
    </StrictMode>,
)
