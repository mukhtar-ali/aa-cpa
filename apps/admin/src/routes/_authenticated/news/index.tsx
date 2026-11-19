import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { News } from '@/features/news'
import { requirePermission } from '@/lib/require-permission'

const newsSearchSchema = z.object({
    tab: z.enum(['list', 'page', 'seo']).optional().catch('list'),
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(20),
    search: z.string().optional().catch(''),
    tag: z.array(z.string()).optional().catch([]),
    status: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/news/')({
    beforeLoad: requirePermission(PermissionEnum.AdminPortalNewsView),
    validateSearch: newsSearchSchema,
    component: News,
})
