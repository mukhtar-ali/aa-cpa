import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { requirePermission } from '@/lib/route-guards'
import { Sectors } from '@/features/sectors'

export const Route = createFileRoute('/_authenticated/sectors/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalSectorsView),
  component: Sectors,
})
