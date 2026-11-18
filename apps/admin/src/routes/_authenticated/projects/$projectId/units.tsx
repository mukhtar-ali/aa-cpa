import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { Units } from '@/features/units'
import { requirePermission } from '@/lib/require-permission'

const unitsSearchSchema = z.object({
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(20),
    search: z.string().optional().catch(''),
    status: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/projects/$projectId/units')({
    beforeLoad: requirePermission(PermissionEnum.AdminPortalProjectsView),
    validateSearch: unitsSearchSchema,
    component: Units,
})
