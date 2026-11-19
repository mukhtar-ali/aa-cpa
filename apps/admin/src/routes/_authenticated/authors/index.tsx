import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { AuthorsFeature } from '@/features/authors'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/authors/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalNewsView),
  component: AuthorsFeature,
})
