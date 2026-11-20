import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { requirePermission } from '@/lib/require-permission'
import { Leads } from '@/features/leads'

export const Route = createFileRoute('/_authenticated/leads/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalLeadsView),
  component: Leads,
})
