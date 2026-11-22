import { Outlet } from '@tanstack/react-router'
import { Palette, Wrench, UserCog } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from '../settings/components/sidebar-nav' // Correct relative path

const sidebarNavGroups = [
  {
    title: 'User Preferences',
    items: [
      {
        title: 'Profile',
        href: '/user',
        icon: <UserCog size={18} />,
      },
      {
        title: 'Account',
        href: '/user/account',
        icon: <Wrench size={18} />,
      },
      {
        title: 'Appearance',
        href: '/user/appearance',
        icon: <Palette size={18} />,
      },
    ],
    icon: <UserCog size={18} />,
  },
]

export function UserFeatures() {
  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <PageHeader title='User Preferences' description='Manage your personal account settings and preferences.' />
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav groups={sidebarNavGroups} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
