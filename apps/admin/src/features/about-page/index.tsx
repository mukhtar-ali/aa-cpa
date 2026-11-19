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
import { AboutContentForm } from './components/about-content-form'
import { AboutCoreValuesForm } from './components/about-core-values-form'
import { AboutHeroForm } from './components/about-hero-form'
import { AboutLeadershipForm } from './components/about-leadership-form'
import { AboutMissionVisionForm } from './components/about-mission-vision-form'
import { AboutPartnersForm } from './components/about-partners-form'

export function AboutPage() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='About Page' description='Manage the content shown on the public About page.' />

        <Tabs defaultValue='hero'>
          <TabsList className='flex-wrap h-auto'>
            <TabsTrigger value='hero'>Hero</TabsTrigger>
            <TabsTrigger value='content'>About Content</TabsTrigger>
            <TabsTrigger value='mission-vision'>Mission & Vision</TabsTrigger>
            <TabsTrigger value='core-values'>Core Values</TabsTrigger>
            <TabsTrigger value='leadership'>Leadership</TabsTrigger>
            <TabsTrigger value='partners'>Partners</TabsTrigger>
            <TabsTrigger value='seo'>SEO</TabsTrigger>
          </TabsList>
          <TabsContent value='hero' className='mt-4 max-w-2xl'>
            <AboutHeroForm />
          </TabsContent>
          <TabsContent value='content' className='mt-4 max-w-2xl'>
            <AboutContentForm />
          </TabsContent>
          <TabsContent value='mission-vision' className='mt-4 max-w-2xl'>
            <AboutMissionVisionForm />
          </TabsContent>
          <TabsContent value='core-values' className='mt-4 max-w-2xl'>
            <AboutCoreValuesForm />
          </TabsContent>
          <TabsContent value='leadership' className='mt-4 max-w-2xl'>
            <AboutLeadershipForm />
          </TabsContent>
          <TabsContent value='partners' className='mt-4 max-w-2xl'>
            <AboutPartnersForm />
          </TabsContent>
          <TabsContent value='seo' className='mt-4 max-w-2xl'>
            <PageSeoForm pageKey={SeoPage.About} />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
