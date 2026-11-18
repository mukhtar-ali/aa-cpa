import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useQueryClient } from '@tanstack/react-query'
import { Analytics } from './components/analytics'
import { useDashboardStats } from './hooks/use-dashboard-stats'

export function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats()
  const queryClient = useQueryClient()

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <Button
            variant='outline'
            onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
          >
            <RefreshCw className='me-2 h-4 w-4' /> Refresh
          </Button>
        </div>
        <Analytics stats={stats} isLoading={isLoadingStats} />
      </Main>
    </>
  )
}
