import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageSeoForm } from '@/components/page-seo-form'
import { SeoPage } from '@repo/shared'
import { HomeAboutTeaserForm } from './components/home-about-teaser-form'
import { HomeHeroForm } from './components/home-hero-form'
import { HomeShowcaseForm } from './components/home-showcase-form'

export function Home() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='Home Page' description='Manage the content shown on the public homepage.' />

        <Tabs defaultValue='hero'>
          <TabsList className='flex-wrap h-auto'>
            <TabsTrigger value='hero'>Hero Slider</TabsTrigger>
            <TabsTrigger value='showcase'>Showcase</TabsTrigger>
            <TabsTrigger value='about-teaser'>About Teaser</TabsTrigger>
            <TabsTrigger value='seo'>SEO</TabsTrigger>
          </TabsList>
          <TabsContent value='hero' className='mt-4 max-w-2xl'>
            <HomeHeroForm />
          </TabsContent>
          <TabsContent value='showcase' className='mt-4 max-w-2xl'>
            <HomeShowcaseForm />
          </TabsContent>
          <TabsContent value='about-teaser' className='mt-4 max-w-2xl'>
            <HomeAboutTeaserForm />
          </TabsContent>
          <TabsContent value='seo' className='mt-4 max-w-2xl'>
            <PageSeoForm pageKey={SeoPage.Home} />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
