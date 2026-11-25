import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useQueryClient } from '@tanstack/react-query'
import { Analytics } from './components/analytics'
import { ActivityTimeline } from './components/activity-timeline'
import { ContentOverview } from './components/content-overview'
import { ContentPipeline } from './components/content-pipeline'
import { LeadsOverview } from './components/leads-overview'
import { PendingActions } from './components/pending-actions'
import { QuickActionCards } from './components/quick-action-cards'
import { useDashboardStats } from './hooks/use-dashboard-stats'

export function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats()
  const queryClient = useQueryClient()

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <PageHeader title='Dashboard' description='What needs your attention and how your content is doing.' className='mb-4'>
          <Button
            variant='outline'
            onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
          >
            <RefreshCw className='me-2 h-4 w-4' /> Refresh
          </Button>
        </PageHeader>
        <Tabs defaultValue='overview' className='space-y-4'>
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='content'>Content</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='overview' className='space-y-4'>
            <QuickActionCards stats={stats} isLoading={isLoadingStats} />
            <div className='grid gap-4 sm:grid-cols-1 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <ContentOverview stats={stats} isLoading={isLoadingStats} />
              </div>
              <div className='lg:col-span-1'>
                <PendingActions stats={stats} isLoading={isLoadingStats} />
              </div>
            </div>
            <LeadsOverview />
            <ActivityTimeline items={stats?.recentActivity ?? []} isLoading={isLoadingStats} />
          </TabsContent>

          <TabsContent value='content' className='space-y-4'>
            <ContentPipeline stats={stats} isLoading={isLoadingStats} />
          </TabsContent>

          <TabsContent value='analytics' className='space-y-4'>
            <Analytics stats={stats} isLoading={isLoadingStats} />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
