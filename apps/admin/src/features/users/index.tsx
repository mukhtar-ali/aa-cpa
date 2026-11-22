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
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { useUsers } from './hooks/use-users'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = (search.page as number) ?? 1
  const pageSize = (search.pageSize as number) ?? 10

  const searchText = (search.search as string | undefined)?.trim() || undefined
  const { data, isLoading, error } = useUsers(page, pageSize, searchText)

  const users = data?.items ?? []

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='Users' description='Manage your users and their roles here.'>
          <UsersPrimaryButtons />
        </PageHeader>
        {isLoading ? (
          <TableSkeleton columnCount={4} />
        ) : error ? (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>Failed to load users. Please try again.</AlertDescription>
          </Alert>
        ) : (
          <UsersTable
            data={users}
            search={search as Record<string, unknown>}
            navigate={navigate}
            pageCount={data?.totalPages ?? 1}
          />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
