import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { Users } from '@/features/users'
import { requirePermission } from '@/lib/require-permission'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalUsersView),
  validateSearch: usersSearchSchema,
  component: Users,
})
