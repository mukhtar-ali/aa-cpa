import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { Careers } from '@/features/careers'
import { requirePermission } from '@/lib/require-permission'

const careersSearchSchema = z.object({
    tab: z.enum(['jobs', 'applications', 'page-settings', 'seo']).optional().catch('jobs'),
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(20),
    search: z.string().optional().catch(''),
    employmentType: z.array(z.string()).optional().catch([]),
    status: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/careers/')({
    beforeLoad: requirePermission(PermissionEnum.AdminPortalCareersView),
    validateSearch: careersSearchSchema,
    component: Careers,
})
