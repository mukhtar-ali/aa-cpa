import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { AboutPage } from '@/features/about-page'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/about-page/')({
    beforeLoad: requirePermission(PermissionEnum.AdminPortalManageContent),
    component: AboutPage,
})
