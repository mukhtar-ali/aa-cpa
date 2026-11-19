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
import { ContactSubmissionsTable } from './components/contact-submissions-table'
import { useContactSubmissions } from './hooks/use-contact-submissions'
import { validFacet } from '@/lib/table-filters'

const route = getRouteApi('/_authenticated/contact-submissions/')

export function ContactSubmissions() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 20

  const searchText = search.search?.trim() || undefined
  const { data, isLoading, error } = useContactSubmissions({
    pageNumber: page,
    pageSize,
    search: searchText,
    status: validFacet(search.status, ['new', 'contacted', 'closed'] as const),
  })
  const items = data?.items ?? []

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader
          title='Contact Submissions'
          description={data ? `${data.totalCount} total` : 'Messages submitted through the contact page.'}
        />
        {isLoading ? (
          <TableSkeleton columnCount={5} />
        ) : error ? (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>Failed to load submissions. Please try again.</AlertDescription>
          </Alert>
        ) : (
          <ContactSubmissionsTable
            data={items}
            search={search as Record<string, unknown>}
            navigate={navigate}
            pageCount={data?.totalPages ?? 1}
          />
        )}
      </Main>
    </>
  )
}
