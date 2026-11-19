import { ContentSection } from '../components/content-section'
import { SeoTrackingForm } from '../seo-tracking/seo-tracking-form'

export function SettingsSeo() {
  return (
    <ContentSection
      title='SEO Settings'
      desc='Site-wide defaults used by any page that has no SEO of its own. Each page sets its own SEO in its editor (Home, About, Contact).'
    >
      <SeoTrackingForm section='defaults' />
    </ContentSection>
  )
}
