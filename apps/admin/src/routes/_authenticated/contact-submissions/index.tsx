import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { ContactSubmissions } from '@/features/contact-submissions'
import { requirePermission } from '@/lib/require-permission'

const contactSubmissionsSearchSchema = z.object({
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(20),
    search: z.string().optional().catch(''),
    status: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/contact-submissions/')({
    beforeLoad: requirePermission(PermissionEnum.AdminPortalManageContent),
    validateSearch: contactSubmissionsSearchSchema,
    component: ContactSubmissions,
})
