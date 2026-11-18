import { ContentSection } from '../components/content-section'
import { EmailSettingsForm } from './email-settings-form'

export function SettingsEmail() {
  return (
    <ContentSection title='Email Settings' desc='SMTP configuration used to send system emails.'>
      <EmailSettingsForm />
    </ContentSection>
  )
}
