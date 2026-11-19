import { ContentSection } from '../components/content-section'
import { GeneralForm } from './general-form'

export function SettingsGeneral() {
  return (
    <ContentSection
      title='General Info'
      desc='Manage contact details and footer content shown across the site.'
    >
      <GeneralForm />
    </ContentSection>
  )
}
