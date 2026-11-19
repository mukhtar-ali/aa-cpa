import { useLayout } from '@/context/layout-provider'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { filterNavGroupsByPermissions } from './filter-nav-by-permissions'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { useAuthStore } from '@/stores/auth-store'

export function AppSidebar() {
    const { collapsible, variant } = useLayout()
    const user = useAuthStore().auth.user

    const userDisplay = {
        name: user?.fullName ?? 'Admin',
        email: user?.email ?? '',
    }

    const navGroups = filterNavGroupsByPermissions(sidebarData.navGroups, user?.permissions)

    return (
        <Sidebar collapsible={collapsible} variant={variant}>
            <SidebarHeader>
                <AppTitle />
            </SidebarHeader>
            <SidebarContent>
                {navGroups.map((props) => (
                    <NavGroup key={props.title} {...props} />
                ))}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userDisplay} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
