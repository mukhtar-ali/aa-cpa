import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { JobDepartmentsFeature } from '@/features/job-departments'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/job-departments/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalCareersView),
  component: JobDepartmentsFeature,
})
