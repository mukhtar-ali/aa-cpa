import { createFileRoute } from '@tanstack/react-router'
import { UserFeatures } from '@/features/user'

export const Route = createFileRoute('/_authenticated/user')({
  component: UserFeatures,
})
