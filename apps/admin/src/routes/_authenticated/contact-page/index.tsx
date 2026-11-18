import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { ContactPage } from '@/features/contact-page'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/contact-page/')({
    beforeLoad: requirePermission(PermissionEnum.AdminPortalManageContent),
    component: ContactPage,
})
