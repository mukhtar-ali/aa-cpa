import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { requirePermission } from '@/lib/route-guards'
import { SiteContent } from '@/features/site-content'

export const Route = createFileRoute('/_authenticated/site-content/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalSiteContentView),
  component: SiteContent,
})
