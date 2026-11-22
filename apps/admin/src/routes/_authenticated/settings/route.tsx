import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { Settings } from '@/features/settings'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/settings')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalManageContent),
  component: Settings,
})
