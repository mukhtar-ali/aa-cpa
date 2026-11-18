import { Outlet } from '@tanstack/react-router'
import { Info, Share2, Search as SearchIcon, Radar, Send } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavGroups = [
  {
    title: 'System Settings',
    items: [
      {
        title: 'General Info',
        href: '/settings',
        icon: <Info size={18} />,
      },
      {
        title: 'Social Media',
        href: '/settings/social',
        icon: <Share2 size={18} />,
      },
      {
        title: 'SEO Defaults',
        href: '/settings/seo',
        icon: <SearchIcon size={18} />,
      },
      {
        title: 'Tracking',
        href: '/settings/seo-tracking',
        icon: <Radar size={18} />,
      },
      {
        title: 'Email Settings',
        href: '/settings/email',
        icon: <Send size={18} />,
      },
    ],
    icon: <SearchIcon size={18} />,
  },
]

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <PageHeader title='Site Settings' description='Manage site-wide contact info, social links, and SEO.' />
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
