import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TableSkeleton } from '@/components/table-skeleton'
import { PageSeoForm } from '@/components/page-seo-form'
import { SeoPage } from '@repo/shared'
import { ServerSidePagination } from '@/components/data-table/server-side-pagination'
import { ApplicationsList } from './components/applications-list'
import { CareersPageSettingsForm } from './components/careers-page-settings-form'
import { JobsDialogs } from './components/jobs-dialogs'
import { JobsPrimaryButtons } from './components/jobs-primary-buttons'
import { JobsProvider } from './components/jobs-provider'
import { JobsTable } from './components/jobs-table'
import { useJobApplications } from './hooks/use-job-applications'
import { useJobs } from './hooks/use-jobs'
import { publishedFromStatus, validFacet } from '@/lib/table-filters'

const route = getRouteApi('/_authenticated/careers/')

export function Careers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const tab = search.tab ?? 'jobs'
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 20

  const searchText = search.search?.trim() || undefined
  const jobsQuery = useJobs({
    pageNumber: page,
    pageSize,
    search: searchText,
    employmentType: validFacet(search.employmentType, ['full_time', 'part_time', 'contract', 'internship'] as const),
    isPublished: publishedFromStatus(search.status),
  })
  // Applications used to be fetched as a fixed first page of 50, so everyone after that was unreachable.
  const [applicationsPage, setApplicationsPage] = useState(1)
  const [applicationsPageSize, setApplicationsPageSize] = useState(20)
  const applicationsQuery = useJobApplications({
    pageNumber: applicationsPage,
    pageSize: applicationsPageSize,
  })
  const applicationsTotal = applicationsQuery.data?.totalCount ?? 0
  const applicationsPages = Math.max(1, applicationsQuery.data?.totalPages ?? 1)

  return (
    <JobsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='Careers' description='Manage job postings and review applications.'>
          {tab === 'jobs' && <JobsPrimaryButtons />}
        </PageHeader>

        <Tabs
          value={tab}
          onValueChange={(value) =>
            navigate({ search: { tab: value as 'jobs' | 'applications' | 'page-settings' | 'seo' } })
          }
        >
          <TabsList>
            <TabsTrigger value='jobs'>
              Job Postings {jobsQuery.data ? `(${jobsQuery.data.totalCount})` : ''}
            </TabsTrigger>
            <TabsTrigger value='applications'>
              Applications {applicationsQuery.data ? `(${applicationsQuery.data.totalCount})` : ''}
            </TabsTrigger>
            <TabsTrigger value='page-settings'>Page Settings</TabsTrigger>
            <TabsTrigger value='seo'>SEO</TabsTrigger>
          </TabsList>

          <TabsContent value='jobs' className='mt-4'>
            {jobsQuery.isLoading ? (
              <TableSkeleton columnCount={4} />
            ) : jobsQuery.error ? (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>Failed to load job postings. Please try again.</AlertDescription>
              </Alert>
            ) : (
              <JobsTable
                data={jobsQuery.data?.items ?? []}
                search={search as Record<string, unknown>}
                navigate={navigate}
                pageCount={jobsQuery.data?.totalPages ?? 1}
              />
            )}
          </TabsContent>

          <TabsContent value='applications' className='mt-4'>
            {applicationsQuery.error ? (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>Failed to load applications. Please try again.</AlertDescription>
              </Alert>
            ) : (
              <>
                <ApplicationsList
                  items={applicationsQuery.data?.items ?? []}
                  isLoading={applicationsQuery.isLoading}
                />
                {/* Also shown on an empty page > 1 (e.g. after deleting the last item of the last page) so the
                    user can always navigate back. */}
                {(applicationsTotal > 0 || applicationsPage > 1) && (
                  <ServerSidePagination
                    className='mt-4'
                    currentPage={applicationsPage}
                    totalPages={applicationsPages}
                    total={applicationsTotal}
                    limit={applicationsPageSize}
                    onPageChange={(next) => setApplicationsPage(Math.min(Math.max(1, next), applicationsPages))}
                    onPageSizeChange={(size) => {
                      setApplicationsPageSize(size)
                      setApplicationsPage(1)
                    }}
                  />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value='page-settings' className='mt-4'>
            <CareersPageSettingsForm />
          </TabsContent>

          <TabsContent value='seo' className='mt-4 max-w-2xl'>
            <PageSeoForm pageKey={SeoPage.Careers} />
          </TabsContent>
        </Tabs>
      </Main>

      <JobsDialogs />
    </JobsProvider>
  )
}
