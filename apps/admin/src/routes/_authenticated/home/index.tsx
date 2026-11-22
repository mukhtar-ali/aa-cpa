import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { Home } from '@/features/home'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/home/')({
    beforeLoad: requirePermission(PermissionEnum.AdminPortalManageContent),
    component: Home,
})
