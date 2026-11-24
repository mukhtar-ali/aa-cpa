import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { requirePermission } from '@/lib/require-permission'
import { Redirects } from '@/features/redirects'

export const Route = createFileRoute('/_authenticated/redirects/')({
    beforeLoad: requirePermission(PermissionEnum.AdminPortalSeoView),
    component: Redirects,
})
