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
import { ContactPageFormSectionForm } from './components/contact-page-form-section-form'
import { ContactPageHeroForm } from './components/contact-page-hero-form'

export function ContactPage() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='Contact Page' description='Manage the content shown on the public Contact page.' />

        <Tabs defaultValue='hero'>
          <TabsList>
            <TabsTrigger value='hero'>Hero</TabsTrigger>
            <TabsTrigger value='form'>Form Section</TabsTrigger>
            <TabsTrigger value='seo'>SEO</TabsTrigger>
          </TabsList>
          <TabsContent value='hero' className='mt-4 max-w-2xl'>
            <ContactPageHeroForm />
          </TabsContent>
          <TabsContent value='form' className='mt-4 max-w-2xl'>
            <ContactPageFormSectionForm />
          </TabsContent>
          <TabsContent value='seo' className='mt-4 max-w-2xl'>
            <PageSeoForm pageKey={SeoPage.Contact} />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
