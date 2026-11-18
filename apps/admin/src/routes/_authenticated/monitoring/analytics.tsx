import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { AnalyticsDashboard } from '@/features/monitoring/components/analytics-dashboard'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/monitoring/analytics')({
  beforeLoad: requirePermission(PermissionEnum.MonitoringView),
  component: AnalyticsPage,
})

const monitoringNav = [
  { title: 'Performance', href: '/monitoring', isActive: false, disabled: false },
  { title: 'Analytics', href: '/monitoring/analytics', isActive: true, disabled: false },
  { title: 'Errors', href: '/monitoring/errors', isActive: false, disabled: false },
]

function AnalyticsPage() {
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
        <AnalyticsDashboard />
      </Main>
    </>
  )
}
