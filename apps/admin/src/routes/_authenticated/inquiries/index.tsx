import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { Inquiries } from '@/features/inquiries'
import { requirePermission } from '@/lib/require-permission'

const inquiriesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/inquiries/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalManageContent),
  validateSearch: inquiriesSearchSchema,
  component: Inquiries,
})
