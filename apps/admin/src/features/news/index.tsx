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
import { NewsDialogs } from './components/news-dialogs'
import { NewsPrimaryButtons } from './components/news-primary-buttons'
import { NewsProvider } from './components/news-provider'
import { NewsTable } from './components/news-table'
import { useNews } from './hooks/use-news'
import { publishedFromStatus, validFacet } from '@/lib/table-filters'

const route = getRouteApi('/_authenticated/news/')

export function News() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const tab = search.tab ?? 'list'
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 20

  const searchText = search.search?.trim() || undefined
  const { data, isLoading, error } = useNews({
    pageNumber: page,
    pageSize,
    search: searchText,
    tag: validFacet(search.tag, ['news', 'event'] as const),
    isPublished: publishedFromStatus(search.status),
  })
  const items = data?.items ?? []

  return (
    <NewsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='News & Events' description={data ? `${data.totalCount} total` : 'Manage news articles and events.'}>
          {tab === 'list' && <NewsPrimaryButtons />}
        </PageHeader>
        <Tabs value={tab} onValueChange={(value) => navigate({ search: { tab: value as 'list' | 'page' | 'seo' } })}>
          <TabsList>
            <TabsTrigger value='list'>Articles</TabsTrigger>
            <TabsTrigger value='page'>Page Hero</TabsTrigger>
            <TabsTrigger value='seo'>SEO</TabsTrigger>
          </TabsList>

          <TabsContent value='list' className='mt-4'>
              {isLoading ? (
                <TableSkeleton columnCount={4} />
              ) : error ? (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>Failed to load articles. Please try again.</AlertDescription>
                </Alert>
              ) : (
                <NewsTable
                  data={items}
                  search={search as Record<string, unknown>}
                  navigate={navigate}
                  pageCount={data?.totalPages ?? 1}
                />
              )}
          </TabsContent>

          <TabsContent value='page' className='mt-4 max-w-2xl'>
            <PageHeroForm page={ListingHeroPage.News} />
          </TabsContent>

          <TabsContent value='seo' className='mt-4 max-w-2xl'>
            <PageSeoForm pageKey={SeoPage.News} />
          </TabsContent>
        </Tabs>
      </Main>

      <NewsDialogs />
    </NewsProvider>
  )
}
