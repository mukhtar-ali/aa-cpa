import { createFileRoute } from '@tanstack/react-router'
import { SpamSettingsFeature } from '@/features/settings/spam'

export const Route = createFileRoute('/_authenticated/settings/spam')({
  component: SpamSettingsFeature,
})
