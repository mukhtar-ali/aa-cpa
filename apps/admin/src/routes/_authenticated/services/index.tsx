import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { requirePermission } from '@/lib/require-permission'
import { Services } from '@/features/services'

export const Route = createFileRoute('/_authenticated/services/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalServicesView),
  component: Services,
})
