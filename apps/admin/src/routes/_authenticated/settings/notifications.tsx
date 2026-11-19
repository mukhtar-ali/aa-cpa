import { createFileRoute } from '@tanstack/react-router'
import { NotificationSettingsFeature } from '@/features/settings/notifications'

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: NotificationSettingsFeature,
})
