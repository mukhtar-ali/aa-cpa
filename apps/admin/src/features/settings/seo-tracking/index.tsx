import { ContentSection } from '../components/content-section'
import { SeoTrackingForm } from './seo-tracking-form'

export function SettingsSeoTracking() {
  return (
    <ContentSection title='Tracking' desc='Analytics (Google Analytics / Tag Manager) loaded on every public page.'>
      <SeoTrackingForm section='tracking' />
    </ContentSection>
  )
}
