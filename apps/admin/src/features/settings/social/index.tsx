import { ContentSection } from '../components/content-section'
import { SocialForm } from './social-form'

export function SettingsSocial() {
  return (
    <ContentSection title='Social Media' desc='Manage the social media links shown across the site.'>
      <SocialForm />
    </ContentSection>
  )
}
