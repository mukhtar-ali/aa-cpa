import { useState } from 'react'
import { ContentSection } from '../components/content-section'
import { SeoTrackingForm } from '../seo-tracking/seo-tracking-form'
import { PageSeoForm } from './page-seo-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SettingsSeo() {
  const [activeTab, setActiveTab] = useState<'per-page' | 'site-defaults'>('per-page')

  return (
    <ContentSection
      title='SEO & Social Settings'
      desc='Configure search engine optimization, Open Graph social images, robots directives, and per-page metadata with live Google search snippet previews.'
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'per-page' | 'site-defaults')} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2 max-w-md'>
          <TabsTrigger value='per-page'>Per-Page SEO</TabsTrigger>
          <TabsTrigger value='site-defaults'>Site Defaults & Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value='per-page' className='space-y-4'>
          <PageSeoForm />
        </TabsContent>

        <TabsContent value='site-defaults' className='space-y-4'>
          <SeoTrackingForm section='defaults' />
        </TabsContent>
      </Tabs>
    </ContentSection>
  )
}
