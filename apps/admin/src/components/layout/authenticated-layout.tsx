import { Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

function getSidebarDefault() {
    if (typeof document === 'undefined') return true
    const cookie = document.cookie
        .split('; ')
        .find((r) => r.startsWith('sidebar_state='))
    return cookie ? cookie.split('=')[1] !== 'false' : true
}

export function AuthenticatedLayout({ children }: { children?: React.ReactNode }) {
    const defaultOpen = getSidebarDefault()
    return (
        <SearchProvider>
            <LayoutProvider>
                <SidebarProvider defaultOpen={defaultOpen}>
                    <SkipToMain />
                    <AppSidebar />
                    <SidebarInset
                        className={cn(
                            '@container/content',
                            'has-data-[layout=fixed]:h-svh',
                            'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]',
                        )}
                    >
                        {children ?? <Outlet />}
                    </SidebarInset>
                </SidebarProvider>
            </LayoutProvider>
        </SearchProvider>
    )
}
