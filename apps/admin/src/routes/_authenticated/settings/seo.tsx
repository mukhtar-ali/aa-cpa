import { createFileRoute } from '@tanstack/react-router'
import { SettingsSeo } from '@/features/settings/seo'

export const Route = createFileRoute('/_authenticated/settings/seo')({
  component: SettingsSeo,
})
