import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ErrorsDashboard } from '@/features/monitoring/components/errors-dashboard'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/monitoring/errors')({
  beforeLoad: requirePermission(PermissionEnum.MonitoringView),
  component: ErrorsPage,
})

const monitoringNav = [
  { title: 'Performance', href: '/monitoring', isActive: false, disabled: false },
  { title: 'Analytics', href: '/monitoring/analytics', isActive: false, disabled: false },
  { title: 'Errors', href: '/monitoring/errors', isActive: true, disabled: false },
]

function ErrorsPage() {
  return (
    <>
      <Header>
        <TopNav links={monitoringNav} />
        <Search className='ms-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <ErrorsDashboard />
      </Main>
    </>
  )
}
