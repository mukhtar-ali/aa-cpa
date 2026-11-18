import { getRouteApi } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TableSkeleton } from '@/components/table-skeleton'
import { InquiriesDialogs } from './components/inquiries-dialogs'
import { InquiriesProvider } from './components/inquiries-provider'
import { InquiriesTable } from './components/inquiries-table'
import { useInquiries } from './hooks/use-inquiries'

const route = getRouteApi('/_authenticated/inquiries/')

export function Inquiries() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = (search.page as number) ?? 1
  const pageSize = (search.pageSize as number) ?? 10

  const searchText = (search.search as string | undefined)?.trim() || undefined
  const { data, isLoading, error } = useInquiries(page, pageSize, searchText)

  const inquiries = data?.items ?? []

  return (
    <InquiriesProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='Inquiries' description='Manage customer inquiries and contact requests.' />
        {isLoading ? (
          <TableSkeleton columnCount={7} />
        ) : error ? (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>Failed to load inquiries. Please try again.</AlertDescription>
          </Alert>
        ) : (
          <InquiriesTable
            data={inquiries}
            search={search as Record<string, unknown>}
            navigate={navigate}
            pageCount={data?.totalPages ?? 1}
          />
        )}
      </Main>

      <InquiriesDialogs />
    </InquiriesProvider>
  )
}
