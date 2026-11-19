import { createFileRoute } from '@tanstack/react-router'
import { PermissionEnum } from '@repo/shared'
import { ArticleCategoriesFeature } from '@/features/article-categories'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/_authenticated/article-categories/')({
  beforeLoad: requirePermission(PermissionEnum.AdminPortalNewsView),
  component: ArticleCategoriesFeature,
})
