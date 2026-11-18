import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { PerformanceDashboard } from '@/features/monitoring/components/performance-dashboard'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/monitoring/')({
  beforeLoad: requirePermission(PermissionEnum.MonitoringView),
  component: MonitoringPage,
})

const monitoringNav = [
  { title: 'Performance', href: '/monitoring', isActive: true, disabled: false },
  { title: 'Analytics', href: '/monitoring/analytics', isActive: false, disabled: false },
  { title: 'Errors', href: '/monitoring/errors', isActive: false, disabled: false },
]

function MonitoringPage() {
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
        <PageHeader
          title='Performance Monitoring'
          description='Track Core Web Vitals and performance metrics across your application'
          className='mb-4'
        >
          <Button variant='outline' onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </PageHeader>
        <PerformanceDashboard />
      </Main>
    </>
  )
}
