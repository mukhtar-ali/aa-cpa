import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { requirePermission } from '@/lib/require-permission'
import { EstimatorAdmin } from '@/features/estimator'

export const Route = createFileRoute('/_authenticated/estimator/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalEstimatorUpdate),
  component: EstimatorAdmin,
})
