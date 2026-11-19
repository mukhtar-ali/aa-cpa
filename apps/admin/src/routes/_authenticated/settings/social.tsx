import { createFileRoute } from '@tanstack/react-router'
import { SettingsSocial } from '@/features/settings/social'

export const Route = createFileRoute('/_authenticated/settings/social')({
  component: SettingsSocial,
})
