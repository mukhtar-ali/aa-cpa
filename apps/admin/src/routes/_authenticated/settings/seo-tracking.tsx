import { createFileRoute } from '@tanstack/react-router'
import { SettingsSeoTracking } from '@/features/settings/seo-tracking'

export const Route = createFileRoute('/_authenticated/settings/seo-tracking')({
  component: SettingsSeoTracking,
})
