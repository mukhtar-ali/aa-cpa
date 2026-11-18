import { getRouteApi, Link } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { Search } from '@/components/search'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { TableSkeleton } from '@/components/table-skeleton'
import { UnitsDialogs } from './components/units-dialogs'
import { UnitsPrimaryButtons } from './components/units-primary-buttons'
import { UnitsProvider } from './components/units-provider'
import { UnitsTable } from './components/units-table'
import { useParentProject, useUnits } from './hooks/use-units'
import { publishedFromStatus } from '@/lib/table-filters'

const route = getRouteApi('/_authenticated/projects/$projectId/units')

export function Units() {
  const { projectId } = route.useParams()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 20

  const { data: project } = useParentProject(projectId)
  const searchText = search.search?.trim() || undefined
  const { data, isLoading, error } = useUnits({
    projectId,
    pageNumber: page,
    pageSize,
    search: searchText,
    isPublished: publishedFromStatus(search.status),
  })
  const items = data?.items ?? []
  const projectTitle = project?.title?.en || project?.slug

  return (
    <UnitsProvider projectId={projectId}>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-col gap-2'>
          <div>
            <Button variant='ghost' size='sm' className='-ms-2 h-8 px-2' asChild>
              <Link to='/projects'>
                <ArrowLeft className='me-1 h-4 w-4' />
                Back to projects
              </Link>
            </Button>
          </div>
          <PageHeader
            title={projectTitle ? `${projectTitle} — Units` : 'Units'}
            description={data ? `${data.totalCount} total` : 'Manage units for this project.'}
          >
            <UnitsPrimaryButtons />
          </PageHeader>
        </div>
        {isLoading ? (
          <TableSkeleton columnCount={7} />
        ) : error ? (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>Failed to load units. Please try again.</AlertDescription>
          </Alert>
        ) : (
          <UnitsTable
            data={items}
            search={search as Record<string, unknown>}
            navigate={navigate}
            pageCount={data?.totalPages ?? 1}
          />
        )}
      </Main>

      <UnitsDialogs />
    </UnitsProvider>
  )
}
