import { getRouteApi } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { TableSkeleton } from '@/components/table-skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeroForm } from '@/components/page-hero-form'
import { PageSeoForm } from '@/components/page-seo-form'
import { ListingHeroPage, SeoPage } from '@repo/shared'
import { ProjectsDialogs } from './components/projects-dialogs'
import { ProjectsPrimaryButtons } from './components/projects-primary-buttons'
import { ProjectsProvider } from './components/projects-provider'
import { ProjectsTable } from './components/projects-table'
import { useProjects } from './hooks/use-projects'
import { publishedFromStatus } from '@/lib/table-filters'

const route = getRouteApi('/_authenticated/projects/')

export function Projects() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const tab = search.tab ?? 'list'
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 20

  const searchText = search.search?.trim() || undefined
  const { data, isLoading, error } = useProjects({
    pageNumber: page,
    pageSize,
    search: searchText,
    isPublished: publishedFromStatus(search.status),
  })
  const items = data?.items ?? []

  return (
    <ProjectsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader
          title='Projects'
          description={data ? `${data.totalCount} total` : 'Manage your real-estate projects.'}
        >
          {tab === 'list' && <ProjectsPrimaryButtons />}
        </PageHeader>
        <Tabs value={tab} onValueChange={(value) => navigate({ search: { tab: value as 'list' | 'page' | 'seo' } })}>
          <TabsList>
            <TabsTrigger value='list'>Projects</TabsTrigger>
            <TabsTrigger value='page'>Page Hero</TabsTrigger>
            <TabsTrigger value='seo'>SEO</TabsTrigger>
          </TabsList>

          <TabsContent value='list' className='mt-4'>
              {isLoading ? (
                <TableSkeleton columnCount={4} />
              ) : error ? (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>Failed to load projects. Please try again.</AlertDescription>
                </Alert>
              ) : (
                <ProjectsTable
                  data={items}
                  search={search as Record<string, unknown>}
                  navigate={navigate}
                  pageCount={data?.totalPages ?? 1}
                />
              )}
          </TabsContent>

          <TabsContent value='page' className='mt-4 max-w-2xl'>
            <PageHeroForm page={ListingHeroPage.Projects} />
          </TabsContent>

          <TabsContent value='seo' className='mt-4 max-w-2xl'>
            <PageSeoForm pageKey={SeoPage.Projects} />
          </TabsContent>
        </Tabs>
      </Main>

      <ProjectsDialogs />
    </ProjectsProvider>
  )
}
