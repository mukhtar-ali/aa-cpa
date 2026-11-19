import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '@/features/auth/reset-password'

const resetPasswordSearchSchema = z.object({
  email: z.string().optional().catch(''),
  otp: z.string().optional().catch(''),
})

export const Route = createFileRoute('/(auth)/reset-password')({
  validateSearch: resetPasswordSearchSchema,
  component: ResetPassword,
})
